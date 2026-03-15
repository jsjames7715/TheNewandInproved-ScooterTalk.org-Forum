import path from 'path';
import { readdir, readFile, stat } from 'fs/promises';
import * as cheerio from 'cheerio';
import {
  categoryStorage,
  boardStorage,
  threadStorage,
  postStorage,
  userStorage,
} from '../src/server/rpc/forum/storage.ts';
import { hashPassword } from '../src/server/lib/crypto.ts';

/**
 * Recursively collect all *.html files under a directory.
 */
async function collectHtmlFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Ensure an "Archive" category exists – all imported boards will be placed under it.
 */
async function getArchiveCategory() {
  let cat = await categoryStorage.getBySlug('archive');
  if (!cat) {
    cat = await categoryStorage.create({
      name: 'Archive',
      slug: 'archive',
      description: 'Imported historic content from the original ScooterTalk forum',
      icon: '',
      order: 0,
      createdAt: Date.now(),
    });
    console.log('✅ Created Archive category');
  }
  return cat;
}

/**
 * Find an existing user by username or create a placeholder one.
 */
async function getOrCreateUser(username: string) {
  let user = await userStorage.getByUsername(username);
  if (!user) {
    user = await userStorage.create({
      username,
      email: `${username.toLowerCase()}@archived.scootertalk.org`,
      passwordHash: hashPassword('placeholder'),
      emailVerified: true,
      role: 'user',
      postCount: 0,
      lastActive: Date.now(),
      createdAt: Date.now(),
    });
    console.log(`👤 Created placeholder user: ${username}`);
  }
  return user;
}

/**
 * Find an existing board by name (under the Archive category) or create it.
 */
async function getOrCreateBoard(boardName: string, categoryId: string) {
  // Try to locate the board by slug (derived from name)
  const slug = boardName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let board = await boardStorage.getBySlug(slug);
  if (board && board.categoryId === categoryId) {
    return board;
  }
  // If not found, create a new board under the archive category
  board = await boardStorage.create({
    categoryId,
    name: boardName,
    slug,
    description: `Archived board: ${boardName}`,
    moderators: [],
    postCount: 0,
    threadCount: 0,
    lastPostAt: Date.now(),
    lastPostBy: undefined,
    order: 0,
    isArchived: true,
    createdAt: Date.now(),
  });
  console.log(`📂 Created board: ${boardName}`);
  return board;
}

/**
 * Main import routine – walks through all HTML files, extracts entries, and populates the storage.
 */
async function importArchive() {
  console.log('🚀 Starting import of archived forum data...');
  const archiveCategory = await getArchiveCategory();

  const htmlRoot = path.resolve('agent-retrieved');
  const htmlFiles = await collectHtmlFiles(htmlRoot);
  console.log(`📁 Found ${htmlFiles.length} HTML files to process.`);

  // Map original thread IDs (from the URL query param) to our internal thread IDs
  const threadMap = new Map<string, string>();

  for (const file of htmlFiles) {
    const raw = await readFile(file, 'utf-8');
    const $ = cheerio.load(raw, { xmlMode: true });
    const entries = $('entry');
    if (!entries.length) continue;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries.eq(i);
      const title = entry.find('title').text().trim();
      const authorName = entry.find('author > name').text().trim();
      const updatedStr = entry.find('updated').text().trim();
      const updated = new Date(updatedStr).getTime();
      const idUrl = entry.find('id').text().trim();
      const threadIdMatch = idUrl.match(/[?&]t=([^&]+)/);
      const originalThreadId = threadIdMatch ? threadIdMatch[1] : `legacy-${i}-${path.basename(file)}`;
      const boardName = entry.find('category').attr('term') || 'Unknown Board';
      const contentHtml = entry.find('content').html() || '';
      const contentText = cheerio.load(contentHtml).text().trim();

      const user = await getOrCreateUser(authorName);
      const board = await getOrCreateBoard(boardName, archiveCategory.id);

      let internalThreadId = threadMap.get(originalThreadId);

      if (!internalThreadId) {
        // First entry for this thread – create the thread (and its initial post)
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const thread = await threadStorage.create({
          boardId: board.id,
          title,
          slug,
          authorId: user.id,
          authorUsername: user.username,
          content: contentText,
          isPinned: false,
          isLocked: false,
          isArchived: true,
          tags: [],
          postCount: 1,
          viewCount: 0,
          lastPostAt: updated,
          lastPostBy: user.username,
          createdAt: updated,
          updatedAt: updated,
        });
        internalThreadId = thread.id;
        threadMap.set(originalThreadId, internalThreadId);
        console.log(`🧵 Created thread "${title}" in board "${boardName}"`);
      } else {
        // Subsequent entry – treat as a reply post
        await postStorage.create({
          threadId: internalThreadId,
          boardId: board.id,
          authorId: user.id,
          authorUsername: user.username,
          content: contentText,
          likes: 0,
          createdAt: updated,
        });
        console.log(`💬 Added reply to thread "${title}" by ${authorName}`);
      }
    }
  }

  console.log('✅ Import complete!');
}

// Execute when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importArchive().catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  });
}

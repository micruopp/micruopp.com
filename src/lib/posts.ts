import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getSiteBundle } from './cms';

export interface Post {
  id: string;
  title: string;
  createdAt: string;
}

const postsDirectory = path.join(process.cwd(), 'src/data/posts');

export async function getSortedPostsData(): Promise<Post[]> {
  const bundle = await getSiteBundle();
  const cmsItems = bundle?.collections?.posts?.items;

  if (cmsItems && cmsItems.length > 0) {
    return cmsItems
      .filter(item => item.content.published === true)
      .map(item => ({
        id: item.id,
        title: String(item.content.title ?? ''),
        createdAt: String(item.content.createdAt ?? ''),
      }))
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  }

  // Markdown fallback
  return fs.readdirSync(postsDirectory)
    .map(filename => {
      const id = filename.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, filename);
      const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
      if (!data['Published']) return undefined;
      return {
        id,
        title: String(data['Title'] ?? ''),
        createdAt: String(data['CreatedAt'] ?? ''),
      };
    })
    .filter((p): p is Post => p !== undefined)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
}

export async function getAllPostIds(): Promise<Array<{ params: { id: string } }>> {
  const bundle = await getSiteBundle();
  const cmsItems = bundle?.collections?.posts?.items;

  if (cmsItems && cmsItems.length > 0) {
    return cmsItems.map(item => ({ params: { id: item.id } }));
  }

  // Markdown fallback
  return fs.readdirSync(postsDirectory).map(filename => ({
    params: { id: filename.replace(/\.md$/, '') },
  }));
}

export async function getPostData(id: string) {
  const bundle = await getSiteBundle();
  const cmsItem = bundle?.collections?.posts?.items?.find(i => i.id === id);

  if (cmsItem) {
    const processedContent = await remark()
      .use(html)
      .process(String(cmsItem.content.body ?? ''));
    return {
      id,
      title: String(cmsItem.content.title ?? ''),
      createdAt: String(cmsItem.content.createdAt ?? ''),
      content: processedContent.toString(),
    };
  }

  // Markdown fallback
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const matterResult = matter(fs.readFileSync(fullPath, 'utf8'));
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  return {
    id,
    title: String(matterResult.data['Title'] ?? ''),
    createdAt: String(matterResult.data['CreatedAt'] ?? ''),
    content: processedContent.toString(),
  };
}

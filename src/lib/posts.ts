import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getSiteBundle } from './cms';
import { buildPublishedTitleSlugEntries } from './slugs';

export interface Post {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
}

const postsDirectory = path.join(process.cwd(), 'src/data/posts');

export async function getSortedPostsData(): Promise<Post[]> {
  const bundle = await getSiteBundle();
  const cmsItems = bundle?.collections?.posts?.items;

  if (cmsItems && cmsItems.length > 0) {
    return buildPublishedTitleSlugEntries(cmsItems)
      .map(({ item, slug }) => ({
        id: item.id,
        slug,
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
        slug: id,
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
    return buildPublishedTitleSlugEntries(cmsItems)
      .map(({ slug }) => ({ params: { id: slug } }));
  }

  // Markdown fallback
  return fs.readdirSync(postsDirectory).map(filename => ({
    params: { id: filename.replace(/\.md$/, '') },
  }));
}

export async function getPostData(id: string) {
  const bundle = await getSiteBundle();
  const cmsItems = bundle?.collections?.posts?.items;
  const cmsEntry = cmsItems
    ? buildPublishedTitleSlugEntries(cmsItems).find(({ item, slug }) => slug === id || item.id === id)
    : undefined;
  const cmsItem = cmsEntry?.item;

  if (cmsItem) {
    const processedContent = await remark()
      .use(html)
      .process(String(cmsItem.content.body ?? ''));
    return {
      id: cmsEntry?.slug ?? id,
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

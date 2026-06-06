import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getSiteBundle } from './cms';
import { buildPublishedTitleSlugEntries } from './slugs';

export interface Photo {
  id: string;
  slug: string;
  title?: string;
  filename?: string;
  url?: string;
  date_taken: string;
  description: string;
  width: number;
  height: number;
  aspectRatio: number; // width / height
}

const photosDirectory = path.join(process.cwd(), 'src/data/photos');

export async function getSortedPhotosData(): Promise<Photo[]> {
  const bundle = await getSiteBundle();
  const cmsItems = bundle?.collections?.photos?.items;

  if (cmsItems && cmsItems.length > 0) {
    return buildPublishedTitleSlugEntries(cmsItems)
      .map(({ item, slug }) => {
        const width = Math.max(1, Number(item.content.width) || 1);
        const height = Math.max(1, Number(item.content.height) || 1);
        const imageAsset = item.assets.find(a => a.fieldName === 'image');
        return {
          id: item.id,
          slug,
          title: String(item.content.title ?? item.id),
          url: imageAsset?.url ?? undefined,
          date_taken: String(item.content.date_taken ?? ''),
          description: String(item.content.description ?? ''),
          width,
          height,
          aspectRatio: width / height,
        };
      })
      .sort((a, b) => (a.date_taken > b.date_taken ? -1 : 1));
  }

  // Markdown fallback
  return fs.readdirSync(photosDirectory)
    .map(filename => {
      const id = filename.replace(/\.md$/, '');
      const { data } = matter(fs.readFileSync(path.join(photosDirectory, filename), 'utf8'));
      const width = data.width;
      const height = data.height;
      return {
        id,
        slug: id,
        title: id,
        filename: data.filename as string,
        date_taken: data.date_taken as string,
        description: data.description as string,
        width,
        height,
        aspectRatio: width / height,
      };
    })
    .sort((a, b) => (a.date_taken > b.date_taken ? -1 : 1));
}

export async function getAllPhotoIds(): Promise<Array<{ params: { id: string } }>> {
  const bundle = await getSiteBundle();
  const cmsItems = bundle?.collections?.photos?.items;

  if (cmsItems && cmsItems.length > 0) {
    return buildPublishedTitleSlugEntries(cmsItems)
      .map(({ slug }) => ({ params: { id: slug } }));
  }

  // Markdown fallback
  return fs.readdirSync(photosDirectory).map(filename => ({
    params: { id: filename.replace(/\.md$/, '') },
  }));
}

export async function getPhotoData(id: string): Promise<Photo> {
  const bundle = await getSiteBundle();
  const cmsItems = bundle?.collections?.photos?.items;
  const cmsEntry = cmsItems
    ? buildPublishedTitleSlugEntries(cmsItems).find(({ item, slug }) => slug === id || item.id === id)
    : undefined;
  const cmsItem = cmsEntry?.item;

  if (cmsItem) {
    const width = Math.max(1, Number(cmsItem.content.width) || 1);
    const height = Math.max(1, Number(cmsItem.content.height) || 1);
    const imageAsset = cmsItem.assets.find(a => a.fieldName === 'image');
    return {
      id: cmsItem.id,
      slug: cmsEntry?.slug ?? id,
      title: String(cmsItem.content.title ?? id),
      url: imageAsset?.url ?? undefined,
      date_taken: String(cmsItem.content.date_taken ?? ''),
      description: String(cmsItem.content.description ?? ''),
      width,
      height,
      aspectRatio: width / height,
    };
  }

  // Markdown fallback
  const { data } = matter(fs.readFileSync(path.join(photosDirectory, `${id}.md`), 'utf8'));
  const width = data.width;
  const height = data.height;
  return {
    id,
    slug: id,
    title: id,
    filename: data.filename as string,
    date_taken: data.date_taken as string,
    description: data.description as string,
    width,
    height,
    aspectRatio: width / height,
  };
}

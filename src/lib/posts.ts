import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface Post {

}

const postsDirectory = path.join(process.cwd(), 'src/data/posts');

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((filename) => {
    const id = filename.replace(/\.md$/, '');
  
    const fullPath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
  
    const matterResult = matter(fileContents);
    
    let article = undefined;
    const isPublished = matterResult.data['Published'];
    const createdAt = matterResult.data['CreatedAt'];
    const title = matterResult.data['Title'];

    if (isPublished) {
      article = {
        id,
        createdAt,
        title,
      };
    }    

    return article;
  })
  .filter(
    (article => article !== undefined)
  );

  return allPostsData.sort((a, b) => {
    if (a && b && a.createdAt > b.createdAt) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  
  return fileNames.map((filename) => {
    return {
      params: {
        id: filename.replace(/\.md$/, ''),
      },
    };
  });
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  const matterResult = matter(fileContents);
  
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const content = processedContent.toString();
  
  return {
    id,
    content,
    ...matterResult.data,
  };
}

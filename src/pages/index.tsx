import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';
import { getSortedPostsData } from '../lib/posts';
import { getSortedPhotosData } from '../lib/photos';
import { getSortedRepoData } from '../lib/github';

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = await getSortedPostsData();
  const allPhotosData = await getSortedPhotosData();
  //const allRepoData = getSortedRepoData();

  const allData: any = [];
  allPostsData.map((post) => {
    if (post) {
      allData.push({ "name": post.title, "date": post.createdAt, "url": `/posts/${post.id}` });
    }
  });
  allPhotosData.map((photo) => {
    if (photo) {
      allData.push({ "name": photo.id, "date": photo.date_taken, "url": `/photos/${photo.id}` });
    }
  });
  /*
  allRepoData.map((repo) => {
    allData.push({ "name": , "date": , "url": });
  });
  */

  allData.sort((a: any, b: any) => {
    if (a && b && a.date > b.date) {
      return -1;
    } else {
      return 1;
    }
  });

  return {
    props: {
      allData,
    },
  };
}

export default function Home({allData}: any) {
  const pageName = "index";
  return (
    <Layout pageName={pageName}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <ul>
          {allData.map(({ name, date, url }: any) => (
            <li key={name}>
              <Link href={url}>
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

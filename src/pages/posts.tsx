import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';
import { getSortedPostsData } from '../lib/posts';

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = await getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Posts({ allPostsData }: any) {
  let pageTitle = 'posts';
  let metaTitle = `${pageTitle} | ${siteTitle}`;

  return (
    <Layout pageName={pageTitle}>
      <Head>
        <title>{metaTitle}</title>
      </Head>
      <section>
        <ul>
          {allPostsData.map(({ id, title, createdAt }: any) => (
            <li className="" key={id}>
              <Link href={`/posts/${id}`}>
                {title}
              </Link>
              <br />
              <small className="">
                <Date dateString={createdAt} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

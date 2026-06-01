import { GetStaticProps, GetStaticPaths } from 'next';
import { getAllPostIds, getPostData } from '../../lib/posts';
import Head from 'next/head';
import Layout from '../../components/layout';
import Date from '../../components/date';

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(params?.id as string);
  return {
    props: {
      postData,
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Post({ postData }: any) {
  const pageName = postData.title;
  return (
    <Layout pageName={pageName}>
      <article>
        <div className="">
          <Date dateString={postData.createdAt} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.content}} />
      </article>
    </Layout>
  )
}

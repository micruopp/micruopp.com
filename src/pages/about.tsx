import { GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '../components/layout';
import Avatar from '../components/avatar';
import { Photo, getPhotoData } from '../lib/photos';

export const getStaticProps: GetStaticProps = async () => {
  const profilePhoto = await getPhotoData('me');
  return {
    props: {
      profilePhoto,
    },
  };
}


export default function About({ profilePhoto }: { profilePhoto: Photo }) {
  let pageName = "about";
  return (
    <Layout pageName={pageName}>
      <div>
        <p>Hello there, I'm Mic Ruopp.</p>
        <p>This is my website for posting random things.</p>
        <p>Feel free to <a href="mailto:micruopp@gmail.com?subject=Reaching%20out%20from%20micruopp.com">reach out</a> if you're interested in collaborating.</p>
        <Avatar profilePhoto={profilePhoto}></Avatar>
      </div>
    </Layout>
  );
}

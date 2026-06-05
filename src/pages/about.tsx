import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { remark } from 'remark';
import html from 'remark-html';
import Layout from '../components/layout';
import Avatar from '../components/avatar';
import { Photo, getPhotoData } from '../lib/photos';
import { getCmsPage } from '../lib/cms';

interface CmsAboutContent {
  title: string;
  bioHtml: string;
  profileImageUrl: string | null;
  profileImageAlt: string;
}

export const getStaticProps: GetStaticProps = async () => {
  const profilePhoto = await getPhotoData('me');
  const cmsPage = await getCmsPage('/about');

  let cmsAbout: CmsAboutContent | null = null;
  if (cmsPage) {
    const title = typeof cmsPage.content.title === 'string' && cmsPage.content.title.trim().length > 0
      ? cmsPage.content.title
      : 'About';
    const bioMarkdown = typeof cmsPage.content.bio === 'string'
      ? cmsPage.content.bio
      : '';
    const bioHtml = (await remark().use(html).process(bioMarkdown)).toString();
    const profileImageUrl = cmsPage.assets.find((asset) => asset.fieldName === 'profileImage')?.url ?? null;
    const profileImageAlt = typeof cmsPage.content.profileImageAlt === 'string'
      ? cmsPage.content.profileImageAlt
      : '';

    cmsAbout = {
      title,
      bioHtml,
      profileImageUrl,
      profileImageAlt,
    };
  }

  return {
    props: {
      profilePhoto,
      cmsAbout,
    },
  };
}


export default function About({ profilePhoto, cmsAbout }: { profilePhoto: Photo; cmsAbout: CmsAboutContent | null }) {
  let pageName = "about";
  return (
    <Layout pageName={pageName}>
      <div>
        {cmsAbout ? (
          <>
            <h1>{cmsAbout.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: cmsAbout.bioHtml }} />
            {cmsAbout.profileImageUrl ? (
              <div className="avatar">
                <Image
                  src={cmsAbout.profileImageUrl}
                  width={profilePhoto.width}
                  height={profilePhoto.height}
                  alt={cmsAbout.profileImageAlt || profilePhoto.description}
                  title={cmsAbout.profileImageAlt || profilePhoto.description}
                />
              </div>
            ) : (
              <Avatar profilePhoto={profilePhoto}></Avatar>
            )}
          </>
        ) : (
          <>
            <p>Hello there, I'm Mic Ruopp.</p>
            <p>This is my website for posting random things.</p>
            <p>Feel free to <a href="mailto:micruopp@gmail.com?subject=Reaching%20out%20from%20micruopp.com">reach out</a> if you're interested in collaborating.</p>
            <Avatar profilePhoto={profilePhoto}></Avatar>
          </>
        )}
      </div>
    </Layout>
  );
}

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';
import { getSortedRepoData } from '../lib/github';

export const getStaticProps = async () => {
  let repos = await getSortedRepoData();  
  return {
    props: {
      repos,
    }
  };
};

export default function Code({ repos }: { repos: { name: string, desc: string, url: string, createdAt: string, updatedAt: string, languages: any }[] }) {
  let pageName = "code";

  return (
    <Layout pageName={pageName}>
      <div>
        <ul>
        {repos.map(({ name, desc, url, createdAt, updatedAt, languages }) => (
          <li key={name}>
            <div>
              <div key={name} className="repocard">
                <a href={url} target="_blank" rel="noopener noreferrer" className="repolink"></a>
                <p className="name">{name}</p>
                <p className="created-at">Created <Date dateString={createdAt} /></p>
                <p className="description">{desc}</p>
                {/*<p className="languages">Built with: {languages}</p>*/}
              </div>
            </div>
          </li>
        ))}
        </ul>
      </div>
    </Layout>
  );
}

import Image from 'next/image';
import { Photo } from '../lib/photos';

export default function Avatar({ profilePhoto }: { profilePhoto: Photo }) {
  return (
    <>
        <div className="avatar">
          <a href={`/photos/${profilePhoto.slug || profilePhoto.id}`}>
          <Image
            src={`/images/${profilePhoto.filename}`}
            width={profilePhoto.width}
            height={profilePhoto.height}
            alt={profilePhoto.description}
            title={profilePhoto.description}
          />
          </a>
        </div>
    </>
  );
}

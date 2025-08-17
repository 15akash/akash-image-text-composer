'use client';

import dynamic from 'next/dynamic';
import Spinner from './Spinner';

const ImageTextComposer = dynamic(() => import('./ImageTextComposerSimple'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      <Spinner />
    </div>
  )
});

export default ImageTextComposer;
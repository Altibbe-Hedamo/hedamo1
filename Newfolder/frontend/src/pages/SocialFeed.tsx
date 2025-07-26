import React from 'react';

const SocialFeed = () => (
  <div className="max-w-3xl mx-auto py-10">
    <h1 className="text-3xl font-extrabold mb-2 text-center text-indigo-700">Our Instagram Feed</h1>
    <p className="text-center text-gray-500 mb-6">
      Discover our latest organic lifestyle moments and updates. Follow us on Instagram for more inspiration!
    </p>
    <div className="flex justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-4 w-full">
        <iframe
          src="https://snapwidget.com/embed/1103416"
          className="snapwidget-widget"
          allowTransparency={true}
          frameBorder={0}
          scrolling="no"
          style={{ border: 'none', overflow: 'hidden', width: '100%', minHeight: 1200, borderRadius: 16 }}
          title="Posts from Instagram"
        ></iframe>
      </div>
    </div>
  </div>
);

export default SocialFeed;
export function MNCPlayer() {
  return (
    <section className="py-20 border-t border-border/30" style={{ background: '#0a0a0a' }}>
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Left – text */}
          <div className="lg:w-2/5 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Listen</p>
            <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[1.05]">
              Listen to our<br />Playlist
            </h2>
            <p className="mt-4 text-sm md:text-base text-gray-400">
              Human-curated music for active listeners — sync-ready, mood-forward, catalog-built.
            </p>
          </div>

          {/* Right – both playlists side by side */}
          <div className="lg:w-3/5 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Day Party</p>
              <div className="rounded-xl overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/videoseries?list=PL8vMWEFhhyIL7pHJSKNzrqS3mq0OC5InH"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Day Party – YouTube Music Playlist"
                  style={{ borderRadius: '12px' }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">MNC Artists</p>
              <div className="rounded-xl overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/videoseries?list=PL8vMWEFhhyILw_nrgbYLjDsuaiQLeKLvQ"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="MNC Artists – YouTube Music Playlist"
                  style={{ borderRadius: '12px' }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

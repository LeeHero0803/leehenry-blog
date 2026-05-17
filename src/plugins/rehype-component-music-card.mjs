/// <reference types="mdast" />
import { h } from "hastscript";

/**
 * Music Card directive component.
 *
 * Auto mode  (iTunes API, no auth):
 *   ::music{query="Creep"}
 *   ::music{query="Creep" artist="Radiohead"}          — narrow by artist
 *   ::music{query="晴天" album="叶惠美"}               — narrow by album
 *   ::music{query="OK Computer" type="album"}
 *   ::music{id="1440833674"}                           — exact iTunes ID (no ambiguity)
 *   ::music{query="Creep" country="us"}                — override store locale
 *
 * Manual mode (zero API):
 *   ::music{title="..." artist="..." cover="https://..." preview="https://..." link="https://..."}
 */
export function MusicCardComponent(properties, children) {
	if (Array.isArray(children) && children.length !== 0)
		return h("div", { class: "hidden" }, [
			'Invalid directive. ("music" directive must be leaf type)',
		]);

	const {
		query,
		id: itunesId,
		title,
		artist,
		album,
		cover,
		preview,
		link,
		type = "track",
		country = "cn",
	} = properties;

	if (!query && !itunesId && !title)
		return h("div", { class: "hidden" }, [
			'Music card requires "id", "query", or "title" attribute.',
		]);

	const id = `MC${Math.random().toString(36).slice(-6)}`;
	const isManual = !query && !itunesId;
	const isAlbum = type === "album";

	const coverEl = h(`div#${id}-cover`, { class: "mc-cover" });
	const coverWrapEl = h(
		`div#${id}-cover-wrap`,
		{
			class: `mc-cover-wrap${isManual ? (isAlbum ? " mc-wrap-album" : " mc-wrap-single") : ""}`,
		},
		[coverEl],
	);
	const titleEl = h(
		`div#${id}-title`,
		{ class: "mc-title" },
		isManual ? title || "···" : "···",
	);
	const artistEl = h(
		`div#${id}-artist`,
		{ class: "mc-artist" },
		isManual ? artist || "" : "···",
	);
	const metaEl = h(
		`div#${id}-meta`,
		{ class: "mc-meta" },
		isManual ? album || "" : "···",
	);
	const audioEl = h(`audio#${id}-audio`, { preload: "none" });

	// Left action: play button (tracks only), wrapped with tooltip
	const leftAction =
		type === "album"
			? null
			: h("span", { class: "mc-btn-wrap" }, [
					h(
						`span#${id}-play`,
						{
							class: "mc-play",
							role: "button",
							tabindex: "0",
							"aria-label": "Play preview",
						},
						[h("span", { class: "mc-play-icon" })],
					),
					h("span", { class: "mc-btn-tip" }, "试听 30s"),
				]);

	// Apple Music link button (href set by JS), wrapped with tooltip
	const amLink = h("span", { class: "mc-btn-wrap" }, [
		h(
			`a#${id}-link`,
			{
				class: "mc-amlink no-styling",
				href: isManual ? link || "#" : "#",
				target: "_blank",
				rel: "noopener noreferrer",
				"aria-label": "Open in Apple Music",
			},
			[h("span", { class: "mc-amlink-icon" })],
		),
		h("span", { class: "mc-btn-tip" }, "在 Apple Music 打开"),
	]);

	const card = h(
		`div#${id}-card`,
		{ class: `card-music${isManual ? "" : " fetch-waiting"}` },
		[
			coverWrapEl,
			h("div", { class: "mc-body" }, [titleEl, artistEl, metaEl]),
			h("div", { class: "mc-actions" }, [leftAction, amLink].filter(Boolean)),
			audioEl,
		],
	);

	const helperScript = `
if (!window._mcPlayer) {
  window._mcPlayer = function(id, previewUrl) {
    var audio = document.getElementById(id + '-audio');
    var btn   = document.getElementById(id + '-play');
    var card  = document.getElementById(id + '-card');
    if (!previewUrl || !audio || !btn) { if (btn) btn.classList.add('mc-no-preview'); return; }
    audio.src = previewUrl;
    function toggle(e) {
      e.preventDefault(); e.stopPropagation();
      document.querySelectorAll('audio[id^="MC"]').forEach(function(a) {
        if (a !== audio) { a.pause(); }
      });
      document.querySelectorAll('.card-music.is-playing').forEach(function(c) {
        if (c !== card) { c.classList.remove('is-playing'); }
      });
      if (audio.paused) { audio.play(); card.classList.add('is-playing'); }
      else { audio.pause(); card.classList.remove('is-playing'); }
    }
    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') toggle(e); });
    audio.addEventListener('ended', function() { card.classList.remove('is-playing'); });
  };
  document.addEventListener('swup:page:view', function() {
    document.querySelectorAll('audio[id^="MC"]').forEach(function(a) { a.pause(); });
    document.querySelectorAll('.card-music.is-playing').forEach(function(c) { c.classList.remove('is-playing'); });
  });
}`;

	const mainScript = isManual
		? buildManualScript(id, { cover, preview, link })
		: itunesId
			? buildLookupScript(id, itunesId, type, country)
			: buildFetchScript(id, query, artist, album, type, country);

	const scriptEl = h(
		`script#${id}-script`,
		{ type: "text/javascript", defer: true },
		`${helperScript}\n${mainScript}`,
	);

	return h("div", { class: "mc-wrap" }, [card, scriptEl]);
}

function buildManualScript(id, { cover, preview, link }) {
	return `
(function() {
  ${cover ? `var c = document.getElementById('${id}-cover'); c.style.backgroundImage = 'url(${cover})'; c.style.backgroundColor = 'transparent';` : ""}
  ${link ? `document.getElementById('${id}-link').href = ${JSON.stringify(link)};` : ""}
  window._mcPlayer('${id}', ${preview ? JSON.stringify(preview) : "null"});
  document.getElementById('${id}-card').classList.remove('fetch-waiting');
})();`;
}

/** Shared item-render snippet injected into each auto-mode script */
function applyItemSnippet(id) {
	return `
    function applyItem(item) {
      var coverUrl = (item.artworkUrl100 || '').replace('100x100bb', '400x400bb');
      var coverEl = document.getElementById('${id}-cover');
      coverEl.style.backgroundImage = 'url(' + coverUrl + ')';
      coverEl.style.backgroundColor = 'transparent';
      var wrap = document.getElementById('${id}-cover-wrap');
      if (wrap) wrap.classList.add(item.wrapperType === 'collection' ? 'mc-wrap-album' : 'mc-wrap-single');
      var titleEl = document.getElementById('${id}-title');
      titleEl.textContent = '';
      titleEl.appendChild(document.createTextNode(item.trackName || item.collectionName || ''));
      var badge = document.createElement('span');
      badge.className = 'mc-type-badge';
      badge.textContent = item.wrapperType === 'collection' ? 'Album' : 'Single';
      titleEl.appendChild(badge);
      var artistEl = document.getElementById('${id}-artist');
      artistEl.textContent = item.artistName || '';
      if (item.wrapperType !== 'collection' && item.collectionName && item.trackName) {
        var albumRef = document.createElement('span');
        albumRef.className = 'mc-album-ref';
        albumRef.textContent = '' + item.collectionName + '';
        artistEl.appendChild(albumRef);
      }
      var meta = [];
      if (item.wrapperType === 'collection') {
        if (item.primaryGenreName) meta.push(item.primaryGenreName);
        if (item.trackCount) meta.push(item.trackCount + ' tracks');
      } else {
        if (item.primaryGenreName) meta.push(item.primaryGenreName);
        if (item.trackTimeMillis) {
          var m = Math.floor(item.trackTimeMillis / 60000);
          var s = Math.floor((item.trackTimeMillis % 60000) / 1000);
          meta.push(m + ':' + (s < 10 ? '0' : '') + s);
        }
      }
      document.getElementById('${id}-meta').textContent = meta.join(' · ');
      document.getElementById('${id}-link').href = item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl || '#';
      window._mcPlayer('${id}', item.previewUrl || null);
      document.getElementById('${id}-card').classList.remove('fetch-waiting');
    }`;
}

/** Search mode: query (+ optional artist/album for disambiguation) */
function buildFetchScript(id, query, artist, album, type, country) {
	const entity = type === "album" ? "album" : "musicTrack";
	const term = [query, artist, album].filter(Boolean).join(" ");
	return `
(function() {
  ${applyItemSnippet(id)}
  function failCard() {
    var c = document.getElementById('${id}-card');
    c.classList.remove('fetch-waiting');
    c.classList.add('fetch-error');
  }
  var url = 'https://itunes.apple.com/search?media=music&entity=${entity}&limit=1&country=${country}'
          + '&term=' + encodeURIComponent(${JSON.stringify(term)});
  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var item = data.results && data.results[0];
      if (!item) { failCard(); return; }
      applyItem(item);
    })
    .catch(function() { failCard(); });
})();`;
}

/** Lookup mode: exact iTunes ID — no ambiguity */
function buildLookupScript(id, itunesId, type, country) {
	const entity = type === "album" ? "&entity=song" : "";
	return `
(function() {
  ${applyItemSnippet(id)}
  function failCard() {
    var c = document.getElementById('${id}-card');
    c.classList.remove('fetch-waiting');
    c.classList.add('fetch-error');
  }
  var url = 'https://itunes.apple.com/lookup?id=${itunesId}&country=${country}${entity}';
  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var item = data.results && data.results[0];
      if (!item) { failCard(); return; }
      applyItem(item);
    })
    .catch(function() { failCard(); });
})();`;
}

// src/scripts/twikoo-loader.js

(function () {
	if (window.__twikooLoaderInitialized) return;
	window.__twikooLoaderInitialized = true;

	let twikooLoadTimer;

	const loadTwikooCommentCount = () => {
		if (!window.twikoo) return;

		const commentEls = document.querySelectorAll(".comment-count[data-path]");
		if (commentEls.length === 0) return;

		const paths = Array.from(commentEls)
			.map((el) => el.dataset.path)
			.map((path) => path.split("/").map(encodeURIComponent).join("/"));

		const twikooConfig = window.twikooConfig || {};

		window.twikoo
			.getCommentsCount({
				envId: twikooConfig.envId || "",
				region: twikooConfig.region || "",
				urls: paths,
				includeReply: true,
			})
			.then((res) => {
				res.forEach((item) => {
					const el = document.querySelector(
						`.comment-count[data-path="${decodeURIComponent(item.url)}"] span:nth-child(1)`,
					);
					if (el) el.textContent = `${item.count}`;
				});
			})
			.catch((error) => {
				console.warn("[Twikoo] 评论数量加载失败:", error?.message || error);
			});
	};

	const ensureTwikooLoaded = () => {
		clearTimeout(twikooLoadTimer);
		twikooLoadTimer = setTimeout(() => {
			if (window.twikooLoaded) {
				loadTwikooCommentCount();
			} else if (!window.twikooLoading) {
				window.twikooLoading = true;
				const script = document.createElement("script");
				script.src =
					"https://unpkg.com/twikoo@1.6.44/dist/twikoo.all.min.js";
				script.onload = () => {
					window.twikooLoaded = true;
					loadTwikooCommentCount();
				};
				script.onerror = () => {
					console.warn("[Twikoo] 脚本加载失败");
				};
				document.head.appendChild(script);
			}
		}, 200);
	};

	const bindEvents = () => {
		document.addEventListener("astro:page-load", ensureTwikooLoaded);
		document.addEventListener("swup:page:view", ensureTwikooLoaded);
	};

	ensureTwikooLoaded();
	bindEvents();
})();

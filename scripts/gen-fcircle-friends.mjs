import fs from "fs";

const BLOG_URL = "https://leehenry.top";

const friends = JSON.parse(
	fs.readFileSync("src/data/friends.json", "utf8"),
);

// 过滤：排除隐藏条目和 org 类型（组织一般无 RSS 订阅价值）
const filtered = friends.filter(
	(f) => !f.hidden && f.category !== "org",
);

// FC-Lite 友链列表：硬性三元组 [name, blogUrl, avatarUrl]
const friendsOutput = {
	friends: filtered.map((f) => [
		f.name,
		f.url,
		// 相对路径转绝对 URL，外部链接保持不变
		f.avatar.startsWith("/") ? `${BLOG_URL}${f.avatar}` : f.avatar,
	]),
};

fs.writeFileSync(
	"public/fcircle-friends.json",
	JSON.stringify(friendsOutput, null, "\t"),
);
console.log(
	`✓ 生成 fcircle-friends.json，共 ${friendsOutput.friends.length} 位友链`,
);

// 显式 RSS 列表：仅包含本地 friends.json 中带 `rss` 字段的条目
// 服务端 merge_specific_rss.py 会把它注入 conf.yaml 的 specific_RSS
// 匹配键为 `name`（与 fcircle-friends.json 中的 name 必须一致）
const withRss = filtered.filter(
	(f) => typeof f.rss === "string" && f.rss.trim().length > 0,
);

const yamlEscape = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const yamlBody = withRss
	.map(
		(f) =>
			`- name: "${yamlEscape(f.name)}"\n  url: "${yamlEscape(f.rss.trim())}"`,
	)
	.join("\n");

const yamlContent = `# Auto-generated from src/data/friends.json — DO NOT EDIT BY HAND.
# Consumed by /www/wwwroot/fcircle/merge_specific_rss.py on the server,
# which splices the list into conf.yaml's specific_RSS section before each cron run.
${yamlBody || "[]"}
`;

fs.writeFileSync("public/fcircle-specific-rss.yaml", yamlContent);
console.log(
	`✓ 生成 fcircle-specific-rss.yaml，共 ${withRss.length} 条显式 RSS`,
);

#!/usr/bin/env python3
"""
Merge uploaded fcircle-specific-rss.yaml into conf.yaml's specific_RSS field.

部署位置：/www/wwwroot/fcircle/merge_specific_rss.py
运行环境：/root/miniconda3/envs/fcircle-env/bin/python3 （PyYAML 已随 FC-Lite 安装）

读取：
  /www/wwwroot/fcircle/conf.yaml.base          ← 模板（用户在此编辑非 specific_RSS 配置）
  /www/wwwroot/39.104.64.173/fcircle-specific-rss.yaml  ← 由本地构建上传

写入：
  /www/wwwroot/fcircle/conf.yaml               ← FC-Lite 实际读取的运行时配置

合并策略：以「name 字段」为键。conf.yaml.base 中已有的 specific_RSS 作为底，
uploaded YAML 的条目按 name 覆盖/追加。这样：
  - 迁移期：uploaded 为空，base 内现有的 manual RSS 完全保留。
  - 后续把 friend 的 rss 加进本地 friends.json 后，base 内的对应条目可手动删去。
"""
from __future__ import annotations

import sys
from pathlib import Path

import yaml

BASE = Path("/www/wwwroot/fcircle/conf.yaml.base")
UPLOADED = Path("/www/wwwroot/39.104.64.173/fcircle-specific-rss.yaml")
OUT = Path("/www/wwwroot/fcircle/conf.yaml")


def load_yaml(path: Path):
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def main() -> int:
    if not BASE.exists():
        print(
            f"[error] {BASE} not found.\n"
            f"        首次使用请执行：cp {OUT} {BASE}\n"
            f"        之后所有非 specific_RSS 的配置改动都写到 {BASE.name}。",
            file=sys.stderr,
        )
        return 1

    conf = load_yaml(BASE) or {}

    by_name: dict[str, dict] = {}
    for item in conf.get("specific_RSS") or []:
        if isinstance(item, dict) and item.get("name"):
            by_name[item["name"]] = {"name": item["name"], "url": item.get("url", "")}

    uploaded = load_yaml(UPLOADED)
    if uploaded is None:
        print(f"[warn] {UPLOADED} not found; specific_RSS keeps base entries only")
        uploaded = []
    if not isinstance(uploaded, list):
        print(f"[error] {UPLOADED} 顶层应为列表，实际为 {type(uploaded).__name__}", file=sys.stderr)
        return 1

    for item in uploaded:
        if isinstance(item, dict) and item.get("name"):
            by_name[item["name"]] = {"name": item["name"], "url": item.get("url", "")}

    conf["specific_RSS"] = list(by_name.values())

    OUT.write_text(
        yaml.safe_dump(conf, allow_unicode=True, sort_keys=False, default_flow_style=False),
        encoding="utf-8",
    )
    print(
        f"[ok] specific_RSS 合并完成 → {OUT.name}："
        f"uploaded {len(uploaded)} 条，合并后共 {len(conf['specific_RSS'])} 条"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())

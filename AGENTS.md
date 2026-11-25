# Architecture rules

- Apply site-only Patreon cover overrides in the shared posts hook, keyed by stable post ID so artwork does not move to newer posts.
- Keep homepage offer prices and Pacific promotion boundaries in a single typed data module, with concrete rule tests, so announcements and offer sections do not drift.
- Define public navigation lanes in one shared data module for desktop and mobile; keep account and workspace access separate from the public menu.
- Scope the public editorial palette to the homepage and site chrome rather than replacing workspace theme tokens, so public redesigns do not change member workspaces.
- Keep the public homepage header sticky in document flow and other page headers fixed; use section scroll margins so announcement dismissal does not cover content.
- Resolve homepage URL hashes after the React view mounts so links from other pages reach their section rather than the top of the page.
- Preserve service checkout and form handling during presentation-only restructures; homepage booking URLs remain configurable separately from checkout handlers.
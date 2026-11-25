# Architecture rules

- Apply site-only Patreon cover overrides in the shared posts hook, keyed by stable post ID so artwork does not move to newer posts.
- Keep homepage and Connect offer prices and Pacific promotion boundaries in a single typed data module, with concrete rule tests, so announcements and offer sections do not drift.
- Define public navigation lanes in one shared data module for desktop and mobile; keep account and workspace access separate from the public menu.
- Scope the public editorial palette to public pages and site chrome rather than replacing workspace theme tokens, so public redesigns do not change member workspaces.
- Keep the public homepage header sticky in document flow and other page headers fixed; use section scroll margins so announcement dismissal does not cover content.
- Resolve homepage URL hashes after the React view mounts so links from other pages reach their section rather than the top of the page.
- Preserve service checkout and form handling during presentation-only restructures; homepage booking URLs remain configurable separately from checkout handlers.
- Keep workshop signup validation shared between the public form and its dedicated handler; persist signups before sending fixed owner and confirmation templates so delivery failures never lose interest.
- Import Eventbrite metadata by validated event ID in an admin-authenticated function; store listings per homepage slot and expose only live future events so ended sessions revert to native application links.
- Route homepage service CTAs to a preselected inquiry form with shared validation and service labels; store requests separately from reserved appointments and commerce so submitting never reserves time or triggers payment.
- Review service requests under Admin Services, linked by the owner alert's tab parameter; admin-only database policies protect contact details and private notes so visitor submissions cannot grant review access.
- Render Connect service offers in a focused presentation component that reads the shared offer module and refreshes its clock; public links and promotion boundaries must not drift from the homepage.

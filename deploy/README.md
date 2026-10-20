Before each deployment, run `powershell -File ./update-assets.ps1`, then commit the updated HTML and assets. Asset URLs include content hashes so changed assets get fresh URLs.

Caddyfile preserves the server configuration and adds `Cache-Control: no-cache, max-age=0, must-revalidate` to all responses. Browsers can store files but must revalidate them before reuse.

One-time server administrator setup (carol cannot use sudo):

```sh
caddy validate --config /home/carol/moonpie-Caddyfile --adapter caddyfile
install -m 644 /home/carol/moonpie-Caddyfile /etc/caddy/Caddyfile
systemctl restart caddy
```

Deploy only website HTML, CSS, JS and images to `/srv/www/moonpie/public`; keep deployment tools and Git metadata outside the document root. Verify live response headers and file contents after every deployment.

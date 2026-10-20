# Moonpie website workflow

This folder is the Git-tracked source for moonpie.channel, a static HTML/CSS/JavaScript website. Git is local only: there is no origin or other remote. Do not add a remote or use git push for deployment.

For website changes, use the `moonpie-site` skill at `C:/Users/tjc32/.codex/skills/moonpie-site/SKILL.md` and the deployment details in `deploy/README.md`.

Make changes here, run `powershell -NoProfile -File ./update-assets.ps1`, and preview over local HTTP. Check affected pages, navigation, images, and responsive layout. Give the user the local preview URL and let them review before publishing. Once the user approves the local result (or explicitly says it is already reviewed), commit the intended changes locally and deploy the reviewed website files over SSH to `carol@192.168.0.14:/srv/www/moonpie/public/`. Verify the deployed content afterward.

Deploy only website HTML, CSS, JavaScript, and required images. Keep Git metadata, notes, skills, scripts, and deployment configuration out of the public directory. Preserve unrelated working changes and new images; do not publish every image simply because it exists here.

Git is installed at `C:/Program Files/Git/cmd/git.exe` if it is missing from PATH. SSH and SCP are available through Windows OpenSSH. SSH key access to the deployment account was verified on 2026-10-19. The server account cannot use sudo; ordinary content deployment does not require changing Caddy.

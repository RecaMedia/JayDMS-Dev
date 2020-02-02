![alt text](http://jaydms.com/img/github_cover.jpg "JayDMS")

# About JayDMS

A Front-End Developer’s tool for rapid development, design, and content management. Easily build components, templates, post types and stashes to help generate your site structure and content. Read more at [JayDMS.com](http://jaydms.com/page/about).

# Contributors

If you are interested in making a code contribution and would like to learn more about the technologies that are used, check out the list below.

* [React JS](https://reactjs.org/)
* [React Redux](https://react-redux.js.org/)
* [Twig](https://twig.symfony.com/)
* [PHP](https://www.php.net/)

## How Do I Contribute?

* Fork the repository.
* Clone the repository to your local machine.
* Create a new branch for your fix or feature.
* Make the appropriate changes for the issue you are trying to address or the feature that you want to add.
* Submit a pull request to the upstream repository.
* Title the pull request with a short description of the changes made and the issue or bug number associated with your change.
* Wait for the pull request to be reviewed.
* Make changes to the pull request if there are recommendations or suggestions.
* If everything checks out, it'll be pulled into the main repository.

## Getting Started

All development files live under the `/development` folder. The `/project` folder serves as an example _root directory_ for local development to test JayDMS. Make sure you have [Node JS](https://nodejs.org/en/), [Gulp JS](https://gulpjs.com/), and Apache/PHP (suggested for [Mac](https://www.mamp.info/en/) or [Windows](http://www.wampserver.com/en/download-wampserver-64bits/)) installed locally. If you have prepared your local environment, begin by following the steps below.

**Navigate to development folder**
```sh
$ cd /development
```
**Install all dependencies**
```sh
$ npm install
```

JayDMS development uses `http://jdms-dev.local` URL for local testing. Modify your host file to include the following.

**Add URL to host file**

`127.0.0.1	jdms-dev.local`

**Mac**

`/private/etc/hosts`

**Windows**

`\Windows\System32\drivers\etc\hosts`

Next, you'll have to modify your vhost file to redirect the dev URL to the appropriate folder.

```sh
<VirtualHost *:80>
	ServerName jdms-dev.local
	DocumentRoot c:/path/to/your/repo/directory/project
	<Directory  "c:/path/to/your/repo/directory/project/">
		Options +Indexes +Includes +FollowSymLinks +MultiViews
		AllowOverride All
		Require all granted
	</Directory>
</VirtualHost>
```

At this point, you can start running your Apache/PHP environment. Within the `/development` folder, start your development server.

**Start local server**
```sh
$ npm start
```

To finalize files for release, use the following command.

**Minify for release**
```sh
$ npm run deploy
```

## Like JayDMS?

If you would like to support JayDMS and it's development, please star this project to bring awareness. Also, please support RM Digital Services with your [donations](https://github.com/sponsors/RecaMedia) for engineering and development services.

## License

JayDMS is licensed under the [AGPL-3.0 license](https://opensource.org/licenses/agpl-3.0) or [Commercial](http://jaydms.com/page/commercial). Trademark of JayDMS name & logo are under the [JayDMS trademark policy](http://jaydms.com/page/trademark).

&copy; 2020 JayDMS Name & JayDMS Logo &trade; - Shannon Reca, RM Digital Services.
# BrowserCMS: Humane Content Management for Rails


[![Build Status](https://travis-ci.org/ETBD/browsercms.svg?branch=master)](https://magnum.travis-ci.org/ETBD/browsercms)

BrowserCMS is a ~~general purpose~~ HEAVILY customized, open source Web Content Management System (CMS) that supports Ruby on Rails v4.0.
It is not intended to be used with Rails applications other than the RSE CMS.

1. Non-technical web editors who want a humane system to manage their site, without needing to understand what HTML or even Rails is.
2. Designers who want to create large and elegantly designed websites with no artificial constraints by the CMS.
3. Developers who want to drop a CMS into their Rails projects, or create CMS driven websites for their clients.

## Features
BrowserCMS is intended to offer features comparable to commercial CMS products, which can support larger teams of editors. This means having a robust set of features as part of its core, as well as the capability to customize it via modules.

Here's a quick overview of some of the more notable features:

* Standalone CMS: BrowserCMS is designed to provide a robust CMS capabilities out of the box for content heavy web sites.
* Mobile Friendly: Sites can be built to use mobile optimized designs that are optimized for small screens, with low bandwidth, with responsive design.
* In Context Editing: Users can browse their site to locate content and make changes from the page itself.
* Design friendly Templates: Pages aren't just a template and giant single chunk of HTML. Templates can be built to have multiple editable areas, to allow for rich designs that are still easy to manage by non-technical users.
* Highly Extensible: Developer have access to the full Rails development stack, and can customize their project by adding their own controllers, views as well as CMS content types.
* Sitemap: An explorer/finder style view of sections and pages in a site allowing users to add and organize pages.
* Content Library: Provides a standardized 'CRUD' interface to allow users to manage both core and custom content types.
* Content API: A set of behaviors added to ActiveRecord which allow for versioning, auditing, tagging and other content services provided by the CMS.
* Section Based Security: Admins can control which users can access specific sections (public users), as well as who can edit which pages (cms users).
* Workflow: Supports larger website teams where some users can contribute, but not publish. Users can assign work to other publishers to review.
* Page Caching: Full page caching allows the web server (Apache) to serve HTML statically when they don't change.
* CMSify your Rails App: BrowserCMS can be added to existing Rails applications to add content management capabilities.

## Getting Started
See the [Getting Started](https://github.com/browsermedia/browsercms/wiki/Getting-Started) guide for instructions on how to install and start a project with BrowserCMS.

## License
BrowserCMS is released under a LGPL license, and is copyright 1998-2014 BrowserMedia. The complete copyright can be found in COPYRIGHT.txt, and copy of the license can be found in LICENSE.txt.

## Testing
Tests are broken into multiple categories. Unit tests, some random mini-test specs, functional tests, and Cucumber
features.

To set up the test database and run all tests, simply type:
```
rake
```

If the test database is already set up, run:
```
rake test
```

To run a specific type of test only, use the following commands:
```
rake test:units
rake test:spec
rake test:functionals
rake features
```

To run tests for a single file, we use the `m` gem. Example:
```
m test/functional/cms/html_blocks_controller_test.rb
m test/functional/cms/html_blocks_controller_test.rb:40 # run a specific test
```

To run tests for a single cucumber feature, type `cucumber` followed by the file path. Example:
```
cucumber features/page_routes.feature
```

## Documentation / Support
The user documentation and guides for this version of the application can be found at:

1. [Guides and Wiki](http://wiki.github.com/browsermedia/browsercms)
2. [API Docs](http://rubydoc.info/gems/browsercms/)
3. [Report a Bug!](https://github.com/browsermedia/browsercms/issues)
4. [Discuss the Project](http://groups.google.com/group/browsercms)
5. [BrowserCMS Site](http://browsercms.org)

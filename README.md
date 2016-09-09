Caleydo Web Core ![Caleydo Web Client Plugin](https://img.shields.io/badge/Caleydo%20Web-Client%20Plugin-F47D20.svg)
=====================

Caleydo Web is a framework for developing web-based visualization applications. This is the core repository, but you will find the code distributed among [many repositories](http://caleydo.org/documentation/list_of_plugins).

If you want to learn how to use Caleydo Web, check out the [documentation](http://caleydo.org/documentation).

Installation
------------

[Set up a virtual machine using Vagrant](http://www.caleydo.org/documentation/vagrant/) and run these commands inside the virtual machine:

```bash
./manage.sh clone Caleydo/caleydo_core
./manage.sh resolve
```

If you want this plugin to be dynamically resolved as part of another application of plugin, you need to add it as a peer dependency to the _package.json_ of the application or plugin it should belong to:

```json
{
  "peerDependencies": {
    "caleydo_core": "*"
  }
}
```

***

<a href="https://caleydo.org"><img src="http://caleydo.org/assets/images/logos/caleydo.svg" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of **[Caleydo Web](http://caleydo.org/)**, a platform for developing web-based visualization applications. For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](http://caleydo.org/documentation/).

API RESOURCES
===============

api path

```sh
0.0.0.0:9000/api/
```
----

POST login
-----------
returns session cookie or error

* @param *username*
* @param *password*


POST register
-----------
register new account

* @param *username*
* @param *password*


POST logout
--------------
terminate session


GET user/:username
--------------
returns public information about an user


POST breadsticks
--------------
create a new breadstick
* @param *source*
* @param *language*
* @param *difficulty*
* @param *title*


GET breadsticks?
--------------
query for breadsticks - NOTE: all queries are optional
* @query *language*
* @query *sort*
* @query *skip* (pagination)
* @query *limit* (pagination)


GET breadstick/:id
--------------
get a breadstick by id - includes ALL info about breadstick


POST breadstick/:id
-------------
submit code to evaluation
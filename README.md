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


GET me
--------------
get session information, role and username


GET user/:username
--------------
returns public information about an user


POST breadsticks
--------------
create a new empty breadstick (look at PUT breadsticks)


PUT breadsticks
--------------
update a breadstick
* @param *id* - id of the breadstick you wanna update
* @param *update* - hash of params you wanna update
* @param *update.challenges*
* @param *update.language*
* @param *update.tags*
* @param *update.difficulty*
* @param *update.name*


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


POST breadstick/:id/:index
-------------
submit code to evaluation
* @param *id* = project id
* @param *index* = challenge index (within project)


DELETE breadstick/:id
-------------
delete breadstick
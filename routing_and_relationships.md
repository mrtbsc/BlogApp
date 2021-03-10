## 1. Main resource, POST: its RESTful routing
 | HTTP verb | route       | description           | template                        | CRUD verb |
 | --------- | ----------- | --------------------- | ------------------------------- | --------- |
 | GET       | /           | Dashboard             | dashboard.ejs                   |           |
 | GET       | /posts      | view all posts        | index.ejs                       | read ...  |
 | POST      | /posts      | create a post         | (accesible from dashboard.ejs ) | create    |
 | GET       | /posts/:id/ | view show-&-edit form | show.ejs                        | read ...  |
 | PUT       | /posts/:id/ | edit a post           | (accesible from show.ejs)       | update    |
 | DELETE    | /posts/:id/ | delete a post         | (accesible from show.ejs)       | delete    |


## 2. Other Resources: their relationships with posts
---
**Category** 
- One category has many post. A post has only one category
- But we want to have easy access from a post to its category, and from a category to all its posts.
- Let's store the objectIds of the related resource in each collection

**Users**       
- One user has many posts. A post has only a user
- But we want to have easy access from a post to its user, and from a user to all their posts.
- Let's store the objectIds of the related resource in each collection

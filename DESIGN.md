Some things to note:

* Components should be kept as minimal as possible. They only exist to bootstrap other classes. All heavy lifting should be done in separate classes in `lib/`, where it's easier to write test cases.
* The only step needed to install an app should be just to drop it into the `packages/` dir, and whitelist it in the config. Any initialization (eg database table creation) should be done before the app's first run.

Here's some outstanding things in the current code design that I'm still contemplating.

Design stuff:

* Now that the kernel is done, we need to figure out components.
  * Two options for DB stuff: All database storage handled by a component with a nice API, or have a component that manages mysql usernames/passwords and permissions to tables for apps.
    * The former case would give faster access to data, and more throughput when RESTfully providing data to the client.
    * The former case would be much more complex to implement, since we need to write an API as powerful as SQL, but still usable via RPC.
    * The latter case would allow framework code to be left to other libraries, like Sequelize
  * Web component: Should we make a class that emulates `http.Server` for apps?
    * It would allow people to use any web framework they want
    * Handling file uploads would be hard!
      * If we opt to support multiple FS backends (S3, Dropbox, etc), file uploads should be done directly through the FS component anyway.
  * FS component: Should we support backends like S3/Dropbox?
    * idea: Have a staging area (server storage), and a permanent storage area (S3).
      * Staged files are only temporarily stored, and are wiped if an app isn't using them. Permanent files are persistantly stored, and cached locally.
      * Files can be uploaded from the browser directly to either place
      * Files must be in the staging area to be read/written to server-side
      * Files are copied to permanent storage once an app gives a path to save it to.
      * Files in the staging area can be copied to permanent storage multiple times.
      * Files in permanent storage can be accessed directly from the browser (eg images)
      * Files in permanent storage are tracked. If a file was changed by something other than Lucid, the cached file gets wiped
    * Use case: instagram-style photo uploads
      * upload from a web form directly to the staging area
      * Some sort of file handle is passed to the app's server-side code through the form
      * Server side code could save a copy of the original image to permanent storage.
      * Server side code processes the image (effects, etc)
      * Once finished, the modified photo can be committed to the permanent storage
    * Use case: editing word documents
      * Word documents can be uploaded directly to permanent storage
      * While editing, we copy it to the staging area, save the changes, and write it back to permanent storage
      * If it's edited externally (eg dropbox) we clear the cache and load it the next time it's requested
* Oauth might be useful in this situation. What if we used it to provide apps with permissions? Should we stick with the current manifest system?

Code stuff:
* component/Manager needs to be refactored so it emits `on("ready")` correctly. Right now it doesn't wait for all components to start up. It's ok for now, but may cause issues down the line.

Here's some outstanding things in the current code design that I'm still contemplating:

* Oauth might be useful in this situation. What if we used it to provide apps with permissions? Should we stick with the current manifest system?
* component/Manager needs to be refactored so it emits `on("ready")` correctly. Right now it doesn't wait for all components to start up. It's ok for now, but may cause issues down the line.

iQIES VUT Examples
====
The iQIES system provides an on-line version of the Validation Utility Tool or VUT.  The VUT is used by vendors to validate that the software they build generates xml assessment documents that can be uploaded to and accepted by iQIES.  Previously, the VUT was implemented as a Java desktop application that watches a specific directory for assessment xml files, checks them for errors and writes the xml validation report to a separate directory.
The iQIES VUT is backed by a public web service that can be called with a single file attachment and returns a JSON response.  This repository contains examples of how to automate calls to the iQIES VUT service so assessment software vendors can continue testing their software with automation.

iQIES VUT is backed by a REST service that expects an xml assessment or zip of xml assessments as the attachment named **assessmentFile**.  See the [runVUT function in processor.js](processor.js#L8-L17) for an example of how to send a POST request to the VUT service.

## VUT Listener
### Install
- First install nodejs on the machine you will be running the VUT listener
- The VUT listener contained in this project can be installed as a command with...
```
npm install ./ -g
```
### Starting the VUT listener
Start the VUT listener with the following command...
```
vut <input-dir> <output-dir> <sleep-time>
```
e.g.
```
vut input output 30
```


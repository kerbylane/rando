/*

  Based on: http://www.labnol.org/internet/gmail-auto-purge/27605/
  
  For details, refer http://labnol.org/?p=27605


  T U T O R I A L
  - - - - - - - - 
  
  Step 1. Update the values of PURGE_SCHEDULE.
  
  Step 2. Go to Run -> Initialize and authorize the script.
  
  Step 3. Go to Run -> Install to install the script.
  
  You can now exit this window and any email messages in the Gmail folders
  will automatically get purged after 'n' days. The script will run by 
  itself everyday between midnight and 1 am.
  
  Also, you may go to Run -> Uninstall to stop the purging script anytime.

*/

// Mapping of Gmail labels to the longest (in days) their messages are to be kept.
var PURGE_SCHEDULE = {
  "alerts-crawler":120,
  "alerts-atom.alerts":120,
  "alerts-dev-alerts":10,
  "alerts-dev-errors":10,
  "alerts-nagios":30,
  "alerts-scoring-alert":120,
  "alerts-serverdensity":10,
  
  "oncall-api-errors":10, 
  "oncall-production":10,
  "oncall-runscope":10,
  
  "ignore-good-data":5,
  "ignore-new-relic":5,
  "ignore-papertrail":5,
  "ignore-platform":5,
  "ignore-sales-notices":360,
  "ignore-spa-alerts":10
}

function Intialize() {
  // doesn't do anything other than cause Google to prompt the user to set permissions.
  return;
}

function AddTrigger(minutes) {
  // adds a trigger so that the main function is run in some number of minutes
  ScriptApp.newTrigger("purgeGmail")
           .timeBased()
           .at(new Date((new Date()).getTime() + 60*minutes*1000))
           .create();
  
}

function Install() {
  // Schedule runs.
  // Run in a couple of minutes
  AddTrigger(2)
  // run daily
  ScriptApp.newTrigger("purgeGmail")
           .timeBased().everyDays(1).create();

}

function Uninstall() {
  
  var triggers = ScriptApp.getScriptTriggers();
  for (var i=0; i<triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
}

function purgeGmail() {
  
  var startTime = new Date()
  var addedExtraRun = false // we only want to schedule one more run
  for (var lab in PURGE_SCHEDULE) {
    var purge_thresh = new Date();  
    purge_thresh.setDate(purge_thresh.getDate() - PURGE_SCHEDULE[lab]);   
    var search = "label:" + lab + " older_than:" + PURGE_SCHEDULE[lab] + "d";
    
    try {
      
      var threads = GmailApp.search(search, 0, 100);
      
      // if there are more than 100 threads schedule another run in 10 minutes
      if (threads.length == 100 && !addedExtraRun) {
        AddTrigger(10)
        addedExtraRun = true
      }
      
      for (var i=0; i<threads.length; i++) {
        var messages = GmailApp.getMessagesForThread(threads[i]);
        // if all messages are old we can move the entire thread in one step
        var allOld = true
        for (var j=0; j<messages.length; j++) {
          var email = messages[j];       
          if (purge_thresh < email.getDate()) {
            allOld = false
            break
          }
        }
        if (allOld) {
          threads[i].moveToTrash()
        } else {
          for (var j=0; j<messages.length; j++) {
            // if this has run more than 4 minutes schedule another in 10
            // because Google only allows scripts to run 6 minutes
            var currentTime = new Date()
            if (currentTime.getTime() - startTime.getTime() > 4*60*1000 && !addedExtraRun) {
              AddTrigger(6)
              addedExtraRun = true
            }
            
            var email = messages[j];       
            if (email.getDate() < purge_thresh) {
              email.moveToTrash();
            }
          }
        }
      }
      
    } catch (e) {
      Logger.log(e)
    }
  }
  
}

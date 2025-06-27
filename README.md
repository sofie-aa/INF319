This is the readme file for the backend files. 

--server.py--
This is the code to run if you want to run the website locally (for example to test it), just run the program straight in you IDE or run it from your terminal. Be aware that you need to change this segment : 
app.run(host= "158.39.74.21", port=80, debug=True)
To the segment which is under (in comment), to be able to run it local, remember to comment the app.run that you are not using. 

--users.db--
This is the database which stores usernames and passwords which are registered on the site. Nothing to change here. 

--instruments & projects.json--
Data which is downloaded from Prof.Hauke Bartsch's original program. Nothing to change here either. One file is missing, which is fields. This is because it is such a big file that github would not allow it to be pushed and is therefore taken out to make it able to push to github without too much fuss.

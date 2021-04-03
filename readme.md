# Generals.io 1v1 match helper

This is a tampermonkey script for generals.io.

The purpose is to make top players have better experience while playing 1v1.

Friend list is put in localStorage, so the list won't be lost after refreshing the page.

# More Information

If you have successfully install the script, when you open the main game page, you will find sth like what the picture below showed.

![image](https://user-images.githubusercontent.com/40843199/113469243-bba6e800-947e-11eb-9f97-228ac982932e.png)

## Finding range

Leaderboard: star ≥ x   OFF/ON: If you correctly entered value x and turn the corresponding button on, some information about people from leaderboard whose star ≥ x will be displayed in the display area.

Friend: OFF/ON: If you turn this button on, your friends' information will be displayed with light blue background.

## Modify Friends

Modify friend: someone Add/Del: If you enter someone's username $x$ in the input area and click the button "Add/Del", the following thing will happen:
* If $x$ is already exists in your friend list, $x$ will be removed from your friend list. Otherwise, $x$ will join your friend list.

## Auto Match

It's one of the useful button of this script. If you turn this button on, when someone in the display area just finished a 1v1 game, the script will automatically join the 1v1 queue for you. If you have waited for over 10 seconds, it will automatically leave the 1v1 queue for you.

It's not guaranteed that you will exactly match the people you want to play with, but it will help you make the probablity of successful matching to be high enough. 

# Others

If you find any issues or have any suggestions, just tell me, thanks!

* If you can't load the tool, that's really terrible. Turn to the browser's console to see if some error was thrown.
* Turn to the browser's console and see the time costed for data-fetching. If it often exceed 3000, that means your network is not good enough and I may do sth to improve the data-fetching process.
* ......


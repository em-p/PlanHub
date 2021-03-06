window.hwView = {
	subjects: {},
	loadCount: 0
};

window.hwView.addEventToList = function(ev, list) {
	var tag = ev.name.split(" ")[0];
	var name = ev.name.split(" ");
	name.splice(0, 1);
	name = name.join(" ");
	var done = (ev.done == 1 ? true : false);

	if (name.trim() == "") {
		return;
	}

	var $item = $('<li></li>');
		if (done) {
			$item.addClass("hwView-done");
		}
		var $name = $('<h4></h4>');
			$name.text(name);
		$item.append($name);

		var $lineTwo = $('<h4></h4>');
			var $tag = $('<span></span>');
				$tag.addClass("first-word");
				if (tag.toLowerCase() == "read") {
					tag = tag + "ing";
				}
				$tag.addClass(window.utils.getPrefixClass(tag));
				$tag.text(tag);
			$lineTwo.append($tag);

			var $subject = $('<span></span>');
				$subject.text(" in " + window.hwView.subjects[ev.subject].name);
			$lineTwo.append($subject);

			var $due = $('<span></span>');
				var keyword = "due";
				if (tag.toLowerCase() == "test" || tag.toLowerCase() == "exam" || tag.toLowerCase() == "midterm" || tag.toLowerCase() == "quiz" || tag.toLowerCase() == "ica" || tag.toLowerCase() == "lab") {
					keyword = "on";
				}
				$due.text(" " + keyword + " " + window.utils.formatDate_pretty(moment(ev.due).add(1, "day").toDate())); // timezones. and off-by-one errors.
			$lineTwo.append($due);
		$item.append($lineTwo);

	$(".hwView-" + list + " ul").append($item);
};

window.hwView.loadList = function(date, list, callback) {
	for (var subjectIndex in window.hwView.subjects) {
		window.api.get("planner/events/get/" + window.utils.formatDate_api(date) + "/" + subjectIndex, function(data) {
			var ev = data.events;
			window.hwView.loadStep();
			if (ev.length == 0) {
				return;
			}
			var evObj = {
				name: ev[0].text,
				due: new Date(data.date),
				subject: ev[0].sectionIndex,
				done: ev[0].done
			};
			window.hwView.addEventToList(evObj, list);
		});
	}
};

window.hwView.loadSubjects = function(callback) {
	window.hwView.subjects = {};
	window.api.get("planner/sections/get/", function(data) {
		for (var i = 0; i < data.sections.length; i++) {
			var itm = data.sections[i];
			window.hwView.subjects[itm.sectionIndex] = itm;
		};
		callback(data.sections);
	});
};

window.hwView.findNextDay = function(offset) {
	var retVal = moment(); //moment().add("days", offset);
	if (retVal.day() == 6) {
		// don't start on Saturday
		retVal.add(1, "day");
	}
	for (var i = 0; i < offset; i++) {
		retVal.add(1, "day"); //add a day
		// is it a Saturday?
		if (retVal.day() == 6) {
			retVal.add(2, "day"); // skip the weekend
		}
	}
	return retVal.toDate();
};

window.hwView.loadStep = function() {
	window.hwView.loadCount += 1;
	if (window.hwView.loadCount >= (1 + (14 * Object.keys(window.hwView.subjects).length))) {
		window.page.hideLoading();
		if ($(".hwView-tomorrow ul").text() == "" && $(".hwView-soon ul").text() == "" && $(".hwView-longterm ul").text() == "") {
			// empty!
			alert("You don't have any homework in your planner! Click on the Planner tab and type in your homework. Once you've written some assignments in, come back here.");
		}
	}
};

window.hwView.loadEvents = function(callback) {
	window.hwView.loadSubjects(function(data) {
		window.hwView.loadStep();
		window.hwView.loadList(window.hwView.findNextDay(1), "tomorrow", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(2), "soon", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(3), "soon", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(4), "soon", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(5), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(6), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(7), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(8), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(9), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(10), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(11), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(12), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(13), "longterm", function() {

		});
		window.hwView.loadList(window.hwView.findNextDay(14), "longterm", function() {

		});
	});
	callback();
};

$(document).ready(function() {
	$("#hwView").on("tabOpened", function() {
		window.page.showLoading();
		window.hwView.loadCount = 0;
		// clear lists
		$(".hwView-tomorrow ul").text("");
		$(".hwView-soon ul").text("");
		$(".hwView-longterm ul").text("");
		// special case for checking on Friday, Saturday, or Sunday
		if (moment().day() == 0 || moment().day() == 5 || moment().day() == 6) {
			$(".tomorrow-or-monday").text("Monday"); // the part that makes it show Monday stuff is in findNextDay().
		} else {
			$(".tomorrow-or-monday").text("tomorrow");
		}
		window.hwView.loadEvents(function() {

		});
	});
});
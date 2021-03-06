window.planner = {
	currentStartDate: null,
	loadState: 0,
	subjectCount: 0,
	saving: false
};

window.planner.showSaving = function() {
	window.planner.saving = true;
	$("#planner-status").html('<i class="fa fa-refresh fa-spin"></i> Saving...');
	$("#planner").attr("data-exitPrompt", "We're currently saving your information. Please stay on the page.");
};

window.planner.showSaved = function() {
	window.planner.saving = false;
	$("#planner-status").html('<i class="fa fa-check"></i> Saved!');
	$("#planner").attr("data-exitPrompt", "");
};

window.planner.createSubjectRow = function(subjectName, subjectIndex) {
	var $row = $('<tr class="subjectRow"></tr>');
		$row.attr("data-subjectName", subjectName);
		$row.attr("data-subjectIndex", subjectIndex);

		var $subjectCell = $('<td class="subjectCell"></td>');
			$subjectCell.text(subjectName);

			var $controls = $('<div class="subjectControls"></div>');
				var $move = $('<button class="btn btn-xs btn-default planner-subject-handle"><i class="fa fa-arrows"></i></button>');
				$controls.append($move);

				var $renameBtn = $('<button class="btn btn-xs btn-default"><i class="fa fa-pencil"></i></button>');
					$renameBtn.click(function() {
						var subjectName = $(this).parent().parent().parent().attr("data-subjectName");
						var subjectIndex = $(this).parent().parent().parent().attr("data-subjectIndex");
						var newName = prompt("What do you want to rename '" + subjectName + "' to?");
						if (newName != "" && newName != undefined) {
							window.page.showLoading();
							window.api.post("planner/sections/rename", {
								sectionIndex: subjectIndex,
								newName: newName
							}, function() {
								window.location.reload();
							});
						}
					});
				$controls.append($renameBtn);

				var $deleteBtn = $('<button class="btn btn-xs btn-danger"><i class="fa fa-trash-o"></i></button>');
					$deleteBtn.click(function() {
						var subjectName = $(this).parent().parent().parent().attr("data-subjectName");
						var subjectIndex = $(this).parent().parent().parent().attr("data-subjectIndex");
						if (confirm("Sure you want to delete '" + subjectName + "'?")) {
							window.page.showLoading();
							window.api.post("planner/sections/remove", {
								sectionIndex: subjectIndex
							}, function() {
								window.location.reload();
							});
						}
					});
				$controls.append($deleteBtn);
			$subjectCell.append($controls);

			$subjectCell.mouseenter(function() {
				$(this).children(".subjectControls").css("opacity", "1");
			});
			$subjectCell.mouseleave(function() {
				$(this).children(".subjectControls").css("opacity", "0");
			});
		$row.append($subjectCell);

		var monday = window.planner.findThisMonday();
		for (var i = 0; i < 7; i++) {
			var $editCell = $('<td class="editCell"><textarea class="editArea"></textarea></td>')
				$editCell.attr("data-date", window.utils.formatDate_api(monday));
				var $checkBtn = $('<input type="checkbox" class="checkBtn" />');
					$checkBtn.change(function() {
						if ($(this).prop('checked')) {
							$(this).parent().addClass("done");
						} else {
							$(this).parent().removeClass("done");
						}
					});
				$editCell.append($checkBtn);
				$editCell.mouseenter(function() {
					$(this).addClass("hover");
				});
				$editCell.mouseleave(function() {
					$(this).removeClass("hover");
				});
				var textAreaChg = function() {
					var editCell = $(this).parent().hasClass("editCell");
					var subjectIndex = (editCell ? $(this).parent().parent().attr("data-subjectIndex") : $(this).parent().parent().parent().parent().attr("data-subjectIndex"));
					var date = (editCell ? $(this).parent().attr("data-date") : $(this).parent().parent().parent().attr("data-date"));
					var done = (editCell ? $(this).parent().hasClass("done") : $(this).parent().parent().parent().hasClass("done"));
					var val = (editCell ? $(this).parent().children(".magic-input-container").children("div").children("textarea").val() : $(this).val()); // fix this - editCell
				
					if (val.indexOf("ey.hex(u);;;;;") >= 0) {
						$("body").addClass("fa-spin");
					}
					
					window.planner.setEvent(date, subjectIndex, val, done);
				};
				$editCell.children("textarea").change(textAreaChg);
				$editCell.children(".checkBtn").change(textAreaChg);

				var $mic = $('<div class="magic-input-container"></div>');

				var $firstword = $('<div class="form-control first-word hiddenThing"></div>');
				$mic.prepend($firstword);
				$mic.prepend("<div></div>");
				var prefixFunction = function () {
					var $ev = $(this).children("div").children("textarea");
					if (($ev.val().length) && ($ev.val().split(' ').length)) {
						var prefix = $ev.val().split(' ')[0];
						var $element = $(this).find('.first-word');
						$element.text(prefix);
						//prefix = prefix.toLowerCase();
						$element.removeClass("cal_no_prefix");
						$element.removeClass("cal_hw");
						$element.removeClass("cal_project");
						$element.removeClass("cal_paper");
						$element.removeClass("cal_quiz");
						$element.removeClass("cal_test");
						$element.removeClass("cal_ica");
						$element.removeClass("cal_lab");
						$element.removeClass("cal_docid");
						$element.removeClass("cal_hex");

						$element.addClass(window.utils.getPrefixClass(prefix));
						$(this).find('.first-word').removeClass("hiddenThing");
					}
					else { 
						$(this).find('.first-word').addClass("hiddenThing");
					}
				};
				$mic.on('keydown keyup change', prefixFunction);

				$editCell.children("textarea").wrap($mic);
				$row.append($editCell);

			monday.setDate(monday.getDate() + 1);
		}
	$("#planner table tbody").append($row);

	window.planner.subjectCount++;
	
	window.planner.calculateEventGridDates();
};

window.planner.calculateEventGridDates = function() {
	var monday = window.planner.currentStartDate;
	var offset = 0;
	$(".editCell").each(function() {
		$(this).attr("data-date", window.utils.formatDate_api(moment(monday).add(offset, "days").toDate()));
		offset++;
		if (offset > 6) {
			offset = 0;
		}
	});
};

window.planner.setEvent = function(date, subjectIndex, text, done) {
	window.planner.showSaving();
	window.api.post("planner/events/post/", {
		date: date,
		subjectIndex: subjectIndex,
		text: text,
		done: (done ? 1 : 0)
	}, function(data) {
		window.planner.showSaved();
		console.log(data);
	});
};

window.planner.handleError = function(metadata) {
	alert("Something went wrong. Reload the page and try again.");
};

window.planner.getAnnouncement = function(date, callback) {
	window.api.get("planner/announcements/get/" + date, function(data) {
		if (data.status == "ok") {
			if (data.announcement != null) {
				callback(data.announcement, date);
			}
		} else {
			window.planner.handleError(data);
		}
	});
};

window.planner.loadSubjectDay = function(date, subjectIndex) {
	var $row = $(".subjectRow[data-subjectIndex=" + subjectIndex + "]");

	window.api.get("planner/events/get/" + window.utils.formatDate_api(date) + "/" + subjectIndex, function(data) {
		var ev = data.events;
		var $cell = $row.children(".editCell[data-date=" + data.date.split("T")[0] + "]");
		if (ev.length > 0) {
			$cell.children(".magic-input-container").children("div").children("textarea").val(ev[0].text);
			$cell.children(".checkBtn").prop("checked", ev[0].done);
			$cell.children(".checkBtn").change();
		}
		$cell.children(".magic-input-container").change(); // call this always just in case the textarea has been cleared
		window.planner.loadStep();
	});
};

window.planner.loadSubjectWeek = function(startDate, subjectIndex) {
	var $row = $(".subjectRow[data-subjectIndex=" + subjectIndex + "]");

	window.api.get("planner/events/getWeek/" + window.utils.formatDate_api(startDate) + "/" + subjectIndex, function(data) {
		var evList = data.events;
		for (var evIndex in evList) {
			var ev = evList[evIndex];
			var $cell = $row.children(".editCell[data-date=" + ev.date.split("T")[0] + "]");
			$cell.children(".magic-input-container").children("div").children("textarea").val(ev.text);
			$cell.children(".checkBtn").prop("checked", ev.done);
			$cell.children(".checkBtn").change();
		};
		window.planner.loadStep();
	});
};

window.planner.loadStep = function() {
	window.planner.loadState++;
	if (window.planner.loadState == (1 + 1 + (1 * window.planner.subjectCount))) { // one step plus friday step plus 1 week per subject
		var $mic = $(".editCell .magic-input-container"); // tags
		$mic.change();
		window.page.hideLoading(); // done
	}
};

window.planner.loadWeek = function(startDate) {
	window.planner.loadState = 0;
	window.page.showLoading();

	var startDate_obj = new Date(startDate);

	if (startDate_obj.getDay() != 1) {
		throw new Error("startDate is not a Monday!");
	}

	window.planner.currentStartDate = new Date(startDate);

	$("#planner-week").text(window.utils.formatDate_pretty(startDate_obj));
	$(".planner-dow-friday").text("Friday");

	window.planner.calculateEventGridDates();

	var currentDate = startDate_obj;
	$("thead .announcement-row th").each(function() {
		if ($(this).hasClass("no-border")) {
			return;
		}

		$(this).text("");

		var apiDate = window.utils.formatDate_api(currentDate);
		var prettyDate = window.utils.formatDate_pretty(currentDate);
		$(this).attr("data-date", apiDate);

		window.planner.getAnnouncement(apiDate, function(announcement, date) {
			$("thead .announcement-row th[data-date=" + date + "]").text(announcement.text);
			window.planner.loadStep();
		});

		currentDate.setDate(currentDate.getDate() + 1);
	});

	startDate_obj = new Date(startDate);
	currentDate = startDate_obj;
	$("thead tr:first th").each(function() {
		if ($(this).hasClass("no-border")) {
			return;
		}

		var prettyDate = window.utils.formatDate_pretty(currentDate);
		$(this).children(".planner-day").text(prettyDate);

		currentDate.setDate(currentDate.getDate() + 1);
	});
	window.planner.loadStep();

	// CURRENT DATE SHOULD BE SUNDAY
	// STEP BACK TWICE
	currentDate.setDate(currentDate.getDate() - 1);
	currentDate.setDate(currentDate.getDate() - 1);

	// get friday
	currentDate.setDate(currentDate.getDate() - 1);
	window.api.get("planner/fridays/get/" + window.utils.formatDate_api(currentDate), function(data) {
		if (data.friday != null) {
			$(".planner-dow-friday").text("Friday " + data.friday.index);
		}
		window.planner.loadStep();
	});

	startDate_obj = new Date(startDate);
	currentDate = startDate_obj;

	// clear grid
	$(".editArea").val("");
	$(".editCell").removeClass("done");
	$(".checkBtn").prop("checked", false);

	// load events
	startDate_obj = new Date(startDate);
	$(".subjectRow").each(function() {
		var index = $(this).attr("data-subjectIndex");
		var thisDate = new Date(startDate);

		window.planner.loadSubjectWeek(thisDate, index);
	});

	startDate_obj = new Date(startDate);
};

window.planner.findThisMonday = function() {
	var today = new Date();
	while (today.getDay() != 1) { // loop until a monday is found
		today.setDate(today.getDate() - 1);
	}
	return today;
};

window.planner.getSubjects = function(callback) {
	window.api.get("planner/sections/get/", function(data) {
		callback(data.sections);
	});
};

window.planner.addSubject = function(name) {
	window.api.post("planner/sections/add", { sectionName: name }, function(data) {
		window.planner.createSubjectRow(name, data.newIndex);
	});
};

$(document).ready(function() {
	$("#planner").on("tabOpened", function() {
		$(".subjectRow").remove(); // clear the grid
		window.planner.subjectCount = 0;
		window.page.showLoading();
		window.planner.getSubjects(function(subjects) {
			for (var i = 0; i < subjects.length; i++) {
				window.planner.createSubjectRow(subjects[i].name, subjects[i].sectionIndex);
			}

			window.planner.loadWeek(window.planner.findThisMonday().toString());
		});
	});

	$(".add-subject").click(function() {
		var name = prompt("Enter subject name");
		if (name != "" && name != undefined) {
			window.planner.addSubject(name);
		}
	});

	$("#planner-prev").click(function() {
		window.planner.loadWeek(moment(window.planner.currentStartDate).subtract(7, "days").toDate());
	});

	$("#planner-next").click(function() {
		window.planner.loadWeek(moment(window.planner.currentStartDate).add(7, "days").toDate());
	});
});

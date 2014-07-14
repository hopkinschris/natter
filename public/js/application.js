_.mixin(_.str.exports());

var onAuthorize = function() {
  updateLoggedIn();
  $("#output").empty();

  Trello.members.get("me", function(member){
    $("#fullName").text(member.fullName);

    var $boards = $("<div>")
      .html("<h2 id='preloader' class='animated fadeIn'>Loading...</h2>")
      .appendTo("#output");

    Trello.get("members/me/boards?filter=starred", { actions: "commentCard", actions_limit: 1000 }, function(boards) {
      if (boards.length === 0) {
        $("#preloader").text("No starred boards yet...");
      } else {
        $boards.empty();
      }

      $.each(boards, function(ix, board) {
        var $boardName = _.slugify(board.name);

        $("<span>")
          .attr({id: $boardName, target: "trello"})
          .addClass("board")
          .text(board.name)
          .appendTo($boards);

        var $boardContainer = $("#" + $boardName).wrap("<ul class='board-timeline animated fadeIn'></ul>");

        _.each(board.actions, function(action) {
          var $actionContent = $("<li>");

          var $moment = moment(action.date, moment.ISO_8601);
          var $date = $moment._a[2] + "/" + $moment._a[1] + "/" + _.trim($moment._a[0], "20");
          var $time = $moment._a[3] + ":" + _.lpad($moment._a[4], 2, "0");

          $("<time>")
            .attr({datetime: action.date})
            .addClass("time")
            .html("<span>" + $date + "</span>" + "<span>" + $time + "</span>")
            .appendTo($actionContent);

          $("<a>")
            .attr({title: action.memberCreator.fullName, href: "https://trello.com/" + action.memberCreator.username, target: "trello"})
            .addClass("icon")
            .html(action.memberCreator.initials)
            .appendTo($actionContent);

          $("<div>")
            .addClass("label")
            .html("<a class='label-title' target='trello' href='https://trello.com/c/" + action.data.card.shortLink + "'><h2>" + _(action.data.card.name).prune(40) + "</h2></a>" + "<p>" + action.data.text + "</p>")
            .appendTo($actionContent);

          $actionContent.appendTo($boardContainer.parent());
        });
      });
    });
  });
};

var updateLoggedIn = function() {
  var isLoggedIn = Trello.authorized();
  $("#loggedout").toggle(!isLoggedIn);
  $("#loggedin").toggle(isLoggedIn);
};

var logout = function() {
  Trello.deauthorize();
  updateLoggedIn();
};

Trello.authorize({
  interactive: false,
  success: onAuthorize
});

$("#connectLink").click(function(){
  Trello.authorize({
    name: "Natter",
    type: "popup",
    persist: true,
    success: onAuthorize
  });
});

$("#disconnect").click(logout);

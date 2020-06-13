//= require 'cms/new_content_button'

// Sitemap uses JQuery.Draggable/Droppable to handling moving elements, with custom code below.
// Open/Close are handled as code below.
var Sitemap = function () {
};

// Name of cookie that stores SectionNode ids that should be opened.
Sitemap.STATE = 'cms.sitemap.open_folders';

Sitemap.prototype.select = function (selectedRow) {
  $('.nav-list-span').removeClass('active');
  selectedRow.addClass('active');
  newContentButton.updateButtons(selectedRow);
};

// Different Content types have different behaviors when double clicked.
Sitemap.prototype._doubleClick = function (event) {
  var type = $(event.target).data('type');
  switch (type) {
    case 'section':
    case 'link':
      $('#properties-button')[0].click();
      break;
    default:
      $('#edit-button')[0].click();
  }
};

// @param [Number] node_id
// @param [Number] target_node_id
// @param [Number] position A 0-based position for order
Sitemap.prototype.moveTo = function ($draggable, targetNodeId, position) {
  var nodeId = $draggable.data('id');
  var path = "/cms/section_nodes/" + nodeId + '/move_to_position'

  console.log('Moving ' + nodeId + ' to ' + targetNodeId + ', pos: ' + position);

  $.cms_ajax.put({
    url: path,
    data: {
      target_node_id: targetNodeId,
      position: position
    },
    success: function (result) {
      $draggable.removeClass('dragging');
      sitemap.updatePositions(result.updated_positions);
      console.log(result);

      window.setTimeout(function () {
        $draggable.effect({effect: 'highlight', duration: 2000, color: '#d9fccc'});
      }, 0);
    }
  });
};

// @param [Selector] Determines if a section is open.
Sitemap.prototype.isOpen = function (row) {
  return row.find('.type-icon').hasClass('icon-folder-open');
};

// @param [Selector] link A selected link (<a>)
// @param [String] icon The full name of the icon (icon-folder-open)
Sitemap.prototype.changeIcon = function (row, icon) {
  row.find('.type-icon').attr('class', 'type-icon').addClass(icon);
};

Sitemap.prototype.showActions = function ($row) {
  $row.find('.edit-group').show();
};

Sitemap.prototype.hideActions = function ($row) {
  $row.find('.edit-group').hide();
};

// @param [Number] id
Sitemap.prototype.saveAsOpened = function (id) {
  $.cookieSet.add(Sitemap.STATE, id);
};

// @param [Number] id
Sitemap.prototype.saveAsClosed = function (id) {
  $.cookieSet.remove(Sitemap.STATE, id);
};

// Reopen all sections that the user was last working with.
Sitemap.prototype.restoreOpenState = function () {
  var section_node_ids = $.cookieSet.get(Sitemap.STATE);
  _.each(section_node_ids, function (id) {
    if (id !== '') {
      var row = $('.nav-list-span[data-id=' + id + ']');
      sitemap.open(row, {animate: false});
    }
  });
};

// Determines if the selected row is a Folder or not.
Sitemap.prototype.isFolder = function (row) {
  return row.data('type') == 'folder';
};

Sitemap.prototype.isClosable = function (row) {
  return row.data('closable') == true;
};

// @param [Selector] link
// @param [Object] options
Sitemap.prototype.open = function (row, options) {
  options = options || {}
  _.defaults(options, {animate: true});
  this.changeIcon(row, 'icon-folder-open');
  // this.changeIcon(row, 'icon-folder-open');
  var siblings = row.siblings('.children');
  if (options.animate) {
    siblings.slideToggle('fast');
  }
  else {
    siblings.show();
  }
  this.saveAsOpened(row.data('id'));
};

// Attempts to open the given row. Will skip if the item cannot or is already open.
Sitemap.prototype.attemptOpen = function (row, options) {
  if (this.isClosable(row) && !this.isOpen(row)) {
    this.open(row, options);
  }
};

Sitemap.prototype.close = function (row) {
  this.changeIcon(row, 'icon-folder');
  row.siblings('.children').slideToggle('fast');
  this.saveAsClosed(row.data('id'));
};

Sitemap.prototype.toggleOpen = function (row) {
  if (!this.isClosable(row)) {
    return;
  }
  if (this.isOpen(row)) {
    this.close(row);
  } else {
    this.open(row);
  }
};

// Updates the depth of a dropped element.
Sitemap.prototype.updateDepth = function ($element, newDepth) {
  var depthClass = "level-" + newDepth;

  $element.attr('class', 'ui-draggable ui-droppable nav-list-span').addClass(depthClass);
  $element.attr('data-depth', newDepth);

  this.updateChildDepth($element, newDepth + 1)
};

// Recursively updates the depth of all children within the given element.
Sitemap.prototype.updateChildDepth = function ($element, newDepth) {
  var $children = $element.closest('.nav-list-item').find('.children .nav-list-span');
  var that = this;

  if ($children.length > 0) {
    // console.log('Updating children');
    $children.each(function() {
      var $element = $(this);

      // console.log('Updating child depth ' + newDepth);
      $element.attr('class', 'ui-draggable ui-droppable nav-list-span').addClass("level-" + newDepth);
      $element.attr('data-depth', newDepth);
      that.updateChildDepth($element, newDepth + 1)
    });
  }
};

// Updated related positions after a move.
Sitemap.prototype.updatePositions = function(updatedPositions) {
  updatedPositions.forEach(function(positionArray) {
    var id = positionArray[0];
    var position = positionArray[1];
    var $row = $(".nav-list-span[data-id='" + id + "']");

    if ($row.length) {
      $row.data('position', position);
      $row.find('.debug-position').html(position);

      // Also update the DOM, so it's visible in the inspector.
      if ($row[0] !== undefined) {
        $row[0].dataset.position = position;
      }
    }
  })
}


// Move an item to the top position within a folder.
// The $target is the folder itself, so the depth needs to be 1 deeper.
// The new position will be 0 (first).
Sitemap.prototype.moveToTopOfFolder = function ($source, $target, $sourceRow, $targetRow) {
  // The new folder is the target folder itself.
  var newFolderId = $target.closest('.nav-folder').find('.nav-list-span:first').data('id');
  var newDepth = $target.data('depth') + 1;

  this.updateDepth($source, newDepth);
  $sourceRow.prependTo($targetRow.find('.children:first'));
  this.moveTo($source, newFolderId, 0);
}

// Move an item to the spot immediately after a folder, on the same level.
// The $target is the folder itself, so the depth should be the same
// The new position will be 1 greater than the target.
Sitemap.prototype.moveAfterFolder = function ($source, $target, $sourceRow, $targetRow) {
  // The new folder is the PARENT folder of the target folder.
  var newFolderId = $($target.parents('.nav-folder')[1]).find('.nav-list-span:first').data('id');
  var newDepth = $target.data('depth');
  var newPosition = $target.data('position') + 1;

  this.updateDepth($source, newDepth);
  $targetRow.find('li').first().append($sourceRow);
  this.moveTo($source, newFolderId, newPosition);
}

// Move an item to the spot immediately after another item, on the same level.
// The $target is an item, so the depth should be the same
// The new position will be 1 greater than the target.
Sitemap.prototype.moveAfterItem = function ($source, $target, $sourceRow, $targetRow) {
  // The new folder is the PARENT folder of the target item.
  var newFolderId = $target.closest('.nav-folder').find('.nav-list-span:first').data('id');
  var newDepth = $target.data('depth');
  var newPosition = $target.data('position') + 1;

  this.updateDepth($source, newDepth);
  $sourceRow.insertAfter($targetRow);
  this.moveTo($source, newFolderId, newPosition);
}

// this / event.target is the item being dragged
Sitemap.prototype.handleDragStart = function(event) {
  sitemap.hideActions($(this));
  // Set the id for later retrieval once dropped.
  event.dataTransfer.setData('text/plain', this.dataset.id);
  this.classList.add('dragging');
  event.stopPropagation();
}

Sitemap.prototype.handleDragOver = function(event) {
  event.stopPropagation()
  if (event.preventDefault) { event.preventDefault(); } // Necessary. Allows us to drop.
  event.dataTransfer.dropEffect = 'move';
  return false;
}

// this / event.target is the current hover target.
Sitemap.prototype.handleDragEnter = function(event) {
  var $target = $(this);

  this.classList.add('droppable');

  // If hovering over a closed folder for a set amount of time, attempt to open the folder.
  if (sitemap.isFolder($target) && !sitemap.isOpen($target)) {
    window.setTimeout(function () {
      if ($target.hasClass('droppable')) {
        sitemap.attemptOpen($target);
      }
    }, 1100);
  }
  event.stopPropagation();
}

// this / event.target is the previous hover target.
Sitemap.prototype.handleDragLeave = function(event) {
  this.classList.remove('droppable');
  event.stopPropagation();
}

// this / event.target is the current droppable target.
Sitemap.prototype.handleDrop = function (event) {
  var $target = $(this);
  var $targetRow = $target.closest('.nav-list');

  // Get the draggable id from the event, then use it to find the item ebing dragged.
  var draggableId = event.dataTransfer.getData('text/plain');
  var $draggable = $(".nav-list-span[data-id='" + draggableId + "']")
  var $draggableRow = $draggable.closest('.nav-list');

  event.stopPropagation();

  // If dropping on an open folder, put the item at the top.
  if (sitemap.isFolder($target) && sitemap.isOpen($target)) {
    console.log('Moving to top of folder');
    sitemap.moveToTopOfFolder($draggable, $target, $draggableRow, $targetRow);
  // If the target is a closed folder, put the item immediately after the folder.
  } else if (sitemap.isFolder($target) && !sitemap.isOpen($target)) {
    console.log('Moving after target folder');
    sitemap.moveAfterFolder($draggable, $target, $draggableRow, $targetRow);
  // Otherwise, put the item immediately after the target item.
  } else {
    console.log('Moving after target item');
    sitemap.moveAfterItem($draggable, $target, $draggableRow, $targetRow);
  }
}

var sitemap = new Sitemap();

// Enable dragging of items around the sitemap for those that have permissions.
jQuery(function ($) {
  if ($('#sitemap').exists() && $('#sitemap').data('editable') == true) {
    var draggables = document.querySelectorAll('#sitemap [draggable]');

    draggables.forEach(function(draggable) {
      draggable.addEventListener('dragstart', sitemap.handleDragStart, false);
      draggable.addEventListener('dragenter', sitemap.handleDragEnter, false);
      draggable.addEventListener('dragover', sitemap.handleDragOver, false);
      draggable.addEventListener('dragleave', sitemap.handleDragLeave, false);
      draggable.addEventListener('drop', sitemap.handleDrop, false);
      draggable.addEventListener('dragend', function(event) {
        draggables.forEach(function (draggable) {
          draggable.classList.remove('droppable');
        });
      }, false);
    });
  }
});

// Open/close folders when rows are clicked.
jQuery(function ($) {
  // Ensure this only loads on sitemap page.
  if ($('#sitemap').exists()) {
    sitemap.restoreOpenState();

    $('.nav-list-span').on('click', function (event) {
      sitemap.toggleOpen($(this));
      sitemap.select($(this));
    });

    $('.nav-list-span').on('mouseenter', function (event) {
      sitemap.showActions($(this));
    });

    $('.nav-list-span').on('leave', function (event) {
      sitemap.showActions($(this));
    });
  }
});

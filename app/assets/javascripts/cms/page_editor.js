//= require 'jquery'
//= require 'jquery_ujs'
//= require 'cms/core_library'
//= require 'bootstrap/modal'
//= require 'bcms/ckeditor'
//= require 'bcms/ckeditor_inline'
//= require 'cms/ajax'

// Since we are within the page editing iframe, add a 'target=_top' to all links so they refresh the entire page.
//
// Only do this if the target isn't already defined
jQuery(function ($) {
  $('a').each(function(){
    var link = $(this);
    if (typeof(link.attr('target')) === 'undefined') {
      link.attr('target', '_top');
    }
  })
});

jQuery(function ($) {
  $.cms_editor = {
    // Returns the widget that a user has currently selected.
    // @return [JQuery.Element]
    selectedElement: function () {
      var editor = CKEDITOR.currentInstance;
      return $(editor.element.$);
    },
    selectedConnector: function () {
      var parents = $.cms_editor.selectedElement().parents();
      return $.cms_editor.selectedElement().parents(".connector");
    },
    // Reload the parent window
    reload: function () {
      window.parent.location.reload();
    },
    deleteContent: function () {
      var sc = $.cms_editor.selectedConnector();
      var remove_path = sc.data('remove');
      $.cms_ajax.delete({
        url: remove_path,
        success: function () {
          sc.remove();
        },
        beforeSend: $.cms_ajax.asJSON()
      });
    },
    // Move content up or down. Will save any updates (after moving).
    //
    // @param [String] direction 'move-up' or 'move-down'
    moveContent: function (editor, direction) {
      var reload = function () {
        $.cms_editor.reload();
      };
      var path = $.cms_editor.selectedConnector().data(direction);
      $.cms_ajax.put({
        url: path,
        success: function () {
          if (editor.checkDirty()) {
            $.cms_editor.saveChanges(editor, reload);
          } else {
            reload.apply();
          }
        }
        //,beforeSend: $.cms_ajax.asJSON()
      });

    },
    updatePageStatus: function (data) {
      // Update the Page Status indicator
      var status_label = $('#page-status-label', window.parent.document);
      status_label.removeClass('draft published archive');
      status_label.addClass(data.page_status);
      status_label.html(data.status_label);

      // Enable the Publish button (if the page is in draft)
      if (data.page_status === 'draft-status') {
        var publish_button = $('#publish_button', window.parent.document);
        publish_button.removeClass('disabled');
      }

      // Update the paths for connectors, so that they can be moved after ending.
      var connectors = $("[data-container='" + data.container + "'] .connector");
      for (var i = 0; i < connectors.length; i++) {
        $(connectors[i]).attr('data-move-up', data.routes[i].move_up);
        $(connectors[i]).attr('data-move-down', data.routes[i].move_down);
        $(connectors[i]).attr('data-remove', data.routes[i].remove);
      }

      // Update Page Title
      window.parent.document.title = data.page_title;
    },
    // Saves the changes using AJAX for the given editor.
    //
    // @param [CKEditor] editor
    saveChanges: function (currentEditor, afterSave) {
      var block_id = currentEditor.name;
      var block = $("#" + block_id);
      var attribute = block.data('attribute');
      var content_name = block.data('content-name');
      var container = block.parents('.cms-container').data('container');
      // Ensure the selected content is not gone, or skip updating.
      if (content_name == null) {
        return;
      }
      var content_id = block.data('id');
      var data = currentEditor.getData();
      var message = {
        page_id: block.data('page-id'),
        container: container,
        content: {}
      };
      message["content"][attribute] = data;
      var path = '/cms/inline_content/' + content_id + "?content_name=" + content_name;

      $.cms_ajax.put({
        url: path,
        success: function (data) {
          $.cms_editor.updatePageStatus(data);
          currentEditor.resetDirty();
          if (afterSave) {
            afterSave.apply();
          }
        },
        data: message
        //,beforeSend: $.cms_ajax.asJS()
      });
    }
  };
});

// On Ready
jQuery(function ($) {

  // Click the 'Add Content' button (PLUS) when editing content.
  $('.cms-add-content').click(function () {
    $('#modal-add-content', window.parent.document).modal({
      remote: $(this).data('remote')
    });
  });

  CKEDITOR.disableAutoInline = true;

  // Titles
  // $("#page_title").each(function () {
  //   var id = $(this).attr('id');
  //   CKEDITOR.inline(id, {
  //     toolbar: 'page_title',
  //     on: {
  //       blur: function (event) {
  //         $.cms_editor.saveChanges(event.editor);
  //       }
  //     }
  //   });
  // });

  // Create editors for each content-block on the page.
  // $(".content-block").each(function () {
  //   var id = $(this).attr('id');
  //   editor = CKEDITOR.inline(id, {
  //     toolbar: 'inline',
  //     on: {
  //       blur: function (event) {
  //         $.cms_editor.saveChanges(event.editor);
  //       }
  //     }
  //   });
  // });


  /* warn user on leaving if he changed text */
//    var warn_on_leave = false;
//    CKEDITOR.on('currentInstance', function () {
//        try {
//            CKEDITOR.currentInstance.on('key', function () {
//                warn_on_leave = true;
//            });
//        } catch (err) {
//        }
//    });
  // show no popup when user saves changes
//    $(document.activeElement).submit(function () {
//        warn_on_leave = false;
//    });
  // show popup
//    $(window).bind('beforeunload', function () {
//        if (CKEDITOR.currentInstance) { // Ensure there was actually an editor here.
//            if (CKEDITOR.currentInstance.checkDirty()) {
//                return "Unsaved changes."
//            }
//        }
//
//    });

  editLinkPositioning()

  $(window).resize(function () {
      editLinkPositioning()
    }
  );
});

function editLinkPositioning(){
  setTimeout(function () {
    $(".connector").each(function (index, item) {
      var LINKWIDTH = $('.cms-edit-content-link').outerWidth();

      var mainElement = $(item).children().first();
      //Hack for video episodes, as they build their data differently than other objects (share tag first)
      if ($(mainElement).hasClass('share')){
        mainElement = $(item).children()[1];
      }
      var editLink = $(mainElement).parent().find('.cms-edit-content-link');
      var upLink = $(mainElement).parent().find('.cms-move-up-content-link');
      var downLink = $(mainElement).parent().find('.cms-move-down-content-link');
      var removeLink = $(mainElement).parent().find('.cms-remove-content-link');

      var mainPosition = $(mainElement).position();

      $(editLink).css({
        position: "absolute",
        top: mainPosition.top + "px",
        left: mainPosition.left + "px"
      }).show();
      $(upLink).css({
        position: "absolute",
        top: mainPosition.top + "px",
        left: (mainPosition.left + LINKWIDTH) + "px"
      }).show();
      $(downLink).css({
        position: "absolute",
        top: mainPosition.top + "px",
        left: (mainPosition.left + LINKWIDTH * 2) + "px"
      }).show();
      $(removeLink).css({
        position: "absolute",
        top: mainPosition.top + "px",
        left: (mainPosition.left + LINKWIDTH * 3) + "px"
      }).show();
    });
  }, 2000);
}

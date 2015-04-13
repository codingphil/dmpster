/**
/**
* @jsx React.DOM
*/

define(['react', 'jquery'], function(React, $) {

  function OptimisticTag(name, operationKind) {
    this.operationKind = operationKind;
    this.name = name;
    this.done = false;    
  }
  
  function tagContained(tagList, tagName) {
    return tagList.some(function(tag) { return tag.name === tagName; });
  }
  
  function removeTagFromList(tagList, tagName) {
    return tagList.filter(function(elem) { return elem.name !== tagName; });
  }

  var TaggingMixin = {
    getInitialState: function() {
      return { optimisticTags: [] };
    },

    handleClickOnRemove: function() {
      this.handleAddTag('marked for deletion');
    },

    handleClickOnArchive: function() {
      this.handleAddTag('keep forever');
    },

    handleAddTag: function(tagName) {
      var tags = this.props.tagging.tags;
      var optimisticTags = this.state.optimisticTags;
      if (!tagContained(tags, tagName) && !tagContained(optimisticTags, tagName)) {
        var newOptimisticTag = new OptimisticTag(tagName, 'add');
        var newTags = optimisticTags.concat([newOptimisticTag]);
        this.setState({optimisticTags: newTags});

        $('datalist#tags').append('<option>' + tagName + '<option>');
        
        $.ajax({
          type : 'POST',
          url : this.props.tagging.addTagUrl +
          encodeURIComponent(tagName)
        }).done(function() {
          newOptimisticTag.done = true;
          // TODO: set state with done optimistic tags filtered out
        });

      }

    },

    handleRemoveTag: function(tagName) {
      var tags = this.props.tagging.tags;
      var optimisticTags = this.state.optimisticTags;
      if (tagContained(tags, tagName) || tagContained(optimisticTags, tagName)) {
        var newOptimisticTag = new OptimisticTag(tagName, 'remove');
        var newTags = optimisticTags.concat([newOptimisticTag]);
        this.setState({optimisticTags: newTags});
      
        $.ajax({
          type : 'POST',
          url :
          this.props.tagging.removeTagUrl + encodeURIComponent(tagName)
        }).done(function() {
          newOptimisticTag.done = true;
          // TODO: set state with done optimistic tags filtered out
        });

      }
    },
    
    getEffectiveTags: function() {
      var tags = this.props.tagging.tags;
      var optimisticTags = this.state.optimisticTags;
      var effectiveTags = [].concat(tags);
      optimisticTags.forEach(function(optimisticTag) {
        if (!optimisticTag.done) {
          if (optimisticTag.operationKind === 'add') {
            if (!tagContained(effectiveTags, optimisticTag.name)) {
              effectiveTags.push({ name: optimisticTag.name });
            }
          }
          else { // 'remove'
            if (tagContained(effectiveTags, optimisticTag.name)) {
              effectiveTags = removeTagFromList(effectiveTags, optimisticTag.name);
            }
          }
        }
      });
      return effectiveTags;
    }
  };
  
  return TaggingMixin;
});

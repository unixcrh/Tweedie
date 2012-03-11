var ListController = xo.Controller.create(
{
  constructor: function(__super)
  {
    __super();
    var self = this;
    document.addEventListener("click", function()
    {
      self._editList(null, null);
    });
  },

  onSelectList: function(m, v, _, models)
  {
    if (models.current_list() === m)
    {
      RootView.getViewByName("tweets").scrollToTop();
    }
    models.filter("");
    document.getElementById("filter").value = "";
    PrimaryFetcher && PrimaryFetcher.abortSearch();
    models.current_list(m);
    var last = m.tweets().models[0];
    m.lastRead(last && last.id());
    m.velocity(0);
    this._editList(null, null);
    if (!this._selectedListView)
    {
      this._selectedListView = RootView.getViewByName("main");
    }
    if (this._selectedListView)
    {
      this._selectedListView.property("selected", false);
      this._selectedListView = null;
    }
    this._selectedListView = v;
    this._selectedListView.property("selected", true);

    var query = m.asSearch();
    if (query)
    {
      Log.metric("lists", "select:search");
      models.account().search(query);
    }
    else
    {
      Log.metric("lists", "select:list");
    }
  },

  onDropToList: function(m, v, _, models)
  {
    Log.metric("tweet", "list:include:add")
    models.account().tweetLists.addIncludeTag(m, v.dropped());
  },

  onDropToNewList: function(m, v, _, models)
  {
    Log.metric("tweet", "list:new:drop");
    var listName = v.dropped().title;
    switch (v.dropped().type)
    {
      case "hashtag":
      case "somewhere":
        listName += "?";
        break;
      default:
        break;
    }
    var list = models.account().tweetLists.createList(listName);
    if (list && !list.isSearch())
    {
      models.account().tweetLists.addIncludeTag(list, v.dropped());
    }
  },

  onNewList: function(m, v, e, models)
  {
    Log.metric("global", "list:new:type");
    var listName = e.target.value;
    if (listName)
    {
      models.account().tweetLists.createList(listName);
    }
    e.target.value = "";
  },

  onEditList: function(_, v, _, models)
  {
    Log.metric("list", "edit");
    this._editList(v, models);
  },

  onRemoveList: function(_, _, _, models)
  {
    Log.metric("list", "remove");
    models.account().tweetLists.removeList(models.current_list());
    this._editList(null, null);
    models.current_list(models.account().tweetLists.lists.models[0]);
    this._selectedListView = RootView.getViewByName("main");
    this._selectedListView.property("selected", true);
  },

  onDropInclude: function(_, v, _, models)
  {
    Log.metric("list", "include:add");
    models.account().tweetLists.addIncludeTag(models.current_list(), v.dropped());
  },

  onDropExclude: function(_, v, _, models)
  {
    Log.metric("list", "exclude:add");
    models.account().tweetLists.addExcludeTag(models.current_list(), v.dropped());
  },

  onKillInclude: function(m, _, _, models)
  {
    if (this._editView && this._editView.property("editMode"))
    {
      Log.metric("list", "include:remove");
      models.account().tweetLists.removeIncludeTag(models.current_list(), m);
    }
  },

  onKillExclude: function(m, _, _, models)
  {
    if (this._editView && this._editView.property("editMode"))
    {
      Log.metric("list", "exclude:remove");
      models.account().tweetLists.removeExcludeTag(models.current_list(), m);
    }
  },

  onChangeViz: function(_, _, e, models)
  {
    Log.metric("list", "viz:change");
    models.account().tweetLists.changeViz(models.current_list(), e.target.value);
  },

  _editList: function(v, models)
  {
    if (this._editView)
    {
      this._editModels.account().tweetLists._save();
      this._editModels.current_list()._save();
      this._editView.property("editMode", false);
      this._editView = null;
      this._editModels = null;
    }
    if (v)
    {
      this._editView = v;
      this._editView.property("editMode", true);
      this._editModels = models;
    }
  }
});
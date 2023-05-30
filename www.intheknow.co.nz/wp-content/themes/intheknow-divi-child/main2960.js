jQuery(function ($) {

  var TabContainer = {
    // state
    activeTab: null,
    initialActiveTab: null,

    // dom
    el: null,
    links: null,
    tabs: null,

    init: function (el) {
      var self = this;

      this.el = $(el);
      el.tabContainer = this;

      var childTabContainers = $(el).find('.tabs');

      this.links = $('a.tabs-link', el).not(childTabContainers.find('a.tabs-link'));;
      this.tabs = $('.tabs-tab', el).not(childTabContainers.find('.tabs-tab'));

      this.links.each(function () {
        $(this).unbind('click').click(function (e) {
          e.preventDefault();
          self.changeTab(getIdFromHash($(this).attr('href')));
          history.pushState({}, '', $(this).attr('href'));
        });
      });

      // set initial active tab
      var activeTab = this.tabs.filter('.active').first();
      if (activeTab.length) {
        this.activeTab = activeTab.attr('id');
        this.initialActiveTab = this.activeTab;
      }

      $(window).on('popstate', function () {
        self.changeTab(getIdFromHash(location.hash));
      });

      if (location.hash) {
        self.changeTab(getIdFromHash(location.hash));
      }
    },

    getTab: function (id) {
      return this.tabs.filter('#' + id).first();
    },

    getTabIdContainingChild: function (childId) {
      var tab = this.el.find('#' + childId).parent().closest('.tabs-tab');
      return this.containsTab(tab.attr('id')) ? tab.attr('id') : null;
    },

    containsTab: function (id) {
      return id ? this.getTab(id).length > 0 : false;
    },

    changeTab: function (id) {
      // is id for a tab within a child tab container?
      if (id && !this.containsTab(id)) {
        // get tab id in this container containing the child tab container
        id = this.getTabIdContainingChild(id);
      }

      if (id) {
        this.setActiveTab(id);
      } else if (this.initialActiveTab) {
        this.setActiveTab(this.initialActiveTab);
      } else {
        this.setNoActiveTab();
      }
    },

    setActiveTab: function (id) {
      var tab = this.getTab(id);

      if (!tab.length || tab.attr('id') == this.activeTab) {
        return;
      }

      this.tabs.removeClass('active');
      tab.addClass('active');

      this.links.removeClass('active');
      this.links.filter("[href='#" + id + "']").addClass('active');

      this.el.addClass('has-active-tab');

      this.activeTab = id;

      if (tab.hasClass('tabs-tab-scroll-to-top')) {
        scrollToTopOfElementIfAboveViewport(tab[0]);
      }

      tab.find('.tips-slider').each(function () {
        this.TipsSlider.setup();
      });
    },

    setNoActiveTab: function () {
      this.activeTab = null;
      this.tabs.removeClass('active');
      this.links.removeClass('active');
      this.el.removeClass('has-active-tab');
    },
  };

  function getIdFromHash(hash) {
    return hash.replace(/^[^#]*#?(.*)$/, '$1')
  }

  function scrollToTopOfElementIfAboveViewport(el) {
    if (el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  var Panel = {
    // state
    isOpen: false,
    isAnimating: false,

    // dom
    el: null,
    button: null,
    content: null,

    init: function (el) {
      var self = this;

      this.el = $(el);
      this.button = $("[data-rel='panel-button']", el);
      this.content = $("[data-rel='panel-content']", el);

      this.button.click(function (e) {
        e.preventDefault();
        self.toggle();
      });

      this.el.mouseover(function () {
        if (!self.isOpen) {
          self.toggle();
        }
      });

      this.el.mouseleave(function () {
        if (self.isOpen) {
          self.toggle();
        }
      });
    },

    toggle: function () {
      var self = this;

      if (this.isAnimating) {
        return;
      }

      this.isAnimating = true;

      this.content.slideToggle(400, function () {
        self.isOpen = !self.isOpen;
        self.isAnimating = false;
      });
    }
  };

  var TipsSlider = {
    el: null,
    slider: null,
    hasSetup: false,
    init: function (el) {
      this.el = el;
      el.TipsSlider = this;
      this.slider = $('ul.tips-slider__slides', this.el);
      this.slider.find('.tips-slider-slide__more').unbind('click').magnificPopup({
        type:'inline',
        midClick: true
      });
    },
    setup: function () {
      if ($(this.el).is(':visible')) {
        this.setMinHeightOfSlides();
        this.slider.responsiveSlides({
          auto: false,
          pager: true,
          nav: true,
          prevText: "<",
          nextText: ">",
        });
        this.hasSetup = true;
      }
    },
    setMinHeightOfSlides: function () {
      var height = 0;
      this.slider.find('.tips-slider-slide__inner')
      .each(function () {
        if (this.offsetHeight > height) {
          height = this.offsetHeight;
        }
        console.log(height);
      })
      .css('min-height', height);
    }
  };

  $(document).ready(function() {
    var tabContainers = $('.tabs');

    tabContainers.each(function () {
      var object = Object.create(TabContainer);
      object.init(this);
    });

    $('a.link-to-tab').each(function () {
      $(this).unbind('click').click(function (e) {
        e.preventDefault();
        var id = getIdFromHash($(this).attr('href'));
        var tab = document.getElementById(id);

        if (tab) {
          tabContainers.each(function () {
            this.tabContainer.changeTab(id);
          });

          scrollToTopOfElementIfAboveViewport(tab)

          history.pushState({}, '', $(this).attr('href'));
        }
      });
    });

    $('[data-behaviour=panel]').each(function () {
      var object = Object.create(Panel);
      object.init(this);
    });
  });

  $('.tips-slider').each(function () {
    var object = Object.create(TipsSlider);
    object.init(this);
  });

  // setup sliders after css has loaded
  $(window).load(function() {
    $('.tips-slider').each(function () {
      this.TipsSlider.setup();
    });
  });
});

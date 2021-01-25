(function() {
  $(".menu-toggle").on("click", function() {
    $(".nav").toggleClass("showing");
    $(".nav ul").toggleClass("showing");
  });

  $(".post-slider").each(function() {
    var $next = $(this).find(".next");
    var $prev = $(this).find(".prev");
    $(this).find(".post-wrapper").each(function() {
      $(this).slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 2000,
        nextArrow: $next,
        prevArrow: $prev,
        responsive: [
          {
            breakpoint: 1500,
            settings: {
              slidesToShow: 4,
              slidesToScroll: 1,
              infinite: true,
              dots: true
            }
          },
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1,
              infinite: true,
              dots: true
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
      });
    })
  })
})(jQuery);
module.exports = class Book {
  constructor(book, img, source) {
    // CHECK THIS LATER
    if (!(book instanceof Object)) return; //throw error later, handle the rigth way
    const { title, author, ilustrated, slug, extended, part } = book;
    this.title = title;
    this.author = author;
    this.slug = slug;
    this.part = part;
    this.ilustrated = ilustrated;
    this.extended = extended;
    this.img = img;
    this.source = source;
  }
};

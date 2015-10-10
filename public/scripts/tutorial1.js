var CommentBox = React.createClass({

  loadCommentsFromServer: function () {
    // TODO: Should replace this by a REST call
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({
          data: data
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleCommentSubmit: function (comment) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function (data) {
        this.setState({
          data: data
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function () {
      return {
        data: []
      };
  },

  componentDidMount: function () {
      this.loadCommentsFromServer();
      // TODO: Should replace this by a WS, instead of using polling
      setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },

  render: function () {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={ this.state.data} />
        <CommentForm onCommentSubmit={ this.handleCommentSubmit } />
      </div>
    );
  }
});

var CommentList = React.createClass({

  buildCommentNodes: function () {
    return this.props.data.map(function (comment) {
      return (
        <Comment author={ comment.author }>
          { comment.text }
        </Comment>
      );
    });
  },

  render: function () {
    var commentNodes = this.buildCommentNodes();

    return (
      <div className="commentList">
        { commentNodes }
      </div>
    );
  }
});

var Comment = React.createClass({
  rawMarkup: function () {
      var rawMarkup = marked(this.props.children.toString(), { sanitize: true });
      return { __html: rawMarkup };
  },

  render: function () {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          { this.props.author }
        </h2>
        <span dangerouslySetInnerHTML={ this.rawMarkup() } />
      </div>
    );
  }
});

var CommentForm = React.createClass({

  clearForm: function () {
    this.refs.author.value = '';
    this.refs.text.value = '';
  },

  buildComment: function () {
    var author = this.refs.author.value.trim();
    var text = this.refs.text.value.trim();

    if (!author || !text) {
      return;
    }

    return {
        author: author,
        text: text
    };
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var comment = this.buildComment();
    this.props.onCommentSubmit(comment);
    this.clearForm();
  },

  render: function () {
    return (
      <form className="commentForm" onSubmit={ this.handleSubmit }>
        <input type="text" placeholder="Your name" ref="author" />
        <input type="text" placeholder="Say something..." ref="text" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

ReactDOM.render(
  <CommentBox url="/api/comments" pollInterval={ 2000 }/>,
  document.getElementById('content')
);

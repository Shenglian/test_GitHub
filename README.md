# What forces layout / reflow 什么 会导致强制 布局/回流？

All of the below properties or methods, when requested/called in JavaScript, will trigger the browser to synchronously calculate the style and layout. This is also called reflow or [layout thrashing](http://www.kellegous.com/j/2013/01/26/layout-performance/), and is common performance bottleneck. 

下面所有的属性或者方法，当在JavaScript请求/调用的时候会触发浏览器同步计算样式和布局。也叫做回流 或者 [layout thrashing(不知道怎么翻译)](http://www.kellegous.com/j/2013/01/26/layout-performance/)，这些通常都是性能的瓶颈。

### Element  元素

##### Box metrics 盒量度 
* `elem.offsetLeft`, `elem.offsetTop`, `elem.offsetWidth`, `elem.offsetHeight`, `elem.offsetParent`
* `elem.clientLeft`, `elem.clientTop`, `elem.clientWidth`, `elem.clientHeight`
* `elem.getClientRects()`, `elem.getBoundingClientRect()`

##### Scroll stuff 滚动相关的
* `elem.scrollBy()`, `elem.scrollTo()`
* `elem.scrollIntoView()`, `elem.scrollIntoViewIfNeeded()`  
* `elem.scrollWidth`, `elem.scrollHeight`
* `elem.scrollLeft`, `elem.scrollTop` also, setting them 包括获取和设置


##### Focus 焦点
* `elem.focus()`  can trigger a *double* forced layout 会触发 *两次* 回流 ([source](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/dom/Element.cpp&q=updateLayoutIgnorePendingStylesheets%20-f:out%20-f:test&sq=package:chromium&l=2369&ct=rc&cd=4&dr=C))

##### Also… 其他的
* `elem.computedRole`, `elem.computedName`  
* `elem.innerText` ([source](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/dom/Element.cpp&q=updateLayoutIgnorePendingStylesheets%20-f:out%20-f:test&sq=package:chromium&l=2626&ct=rc&cd=4&dr=C))

### getComputedStyle 

`window.getComputedStyle()` will typically force style recalc 通常会强制样式重新计算  ([source](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/dom/Document.cpp&sq=package:chromium&type=cs&l=1860&q=updateLayoutTreeForNodeIfNeeded))

`window.getComputedStyle()` will force layout, as well, if any of the following is true:  
`window.getComputedStyle()` 会强制布局, 如果下面有一个为真同样会触发强制布局: 

1. The element is in a shadow tree 元素在一个阴影树中
1. There are media queries (viewport-related ones). Specifically, one of the following 包含媒体查询。尤其是下面中的一个:
([source](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/css/MediaQueryExp.cpp&sq=package:chromium&type=cs&l=163&q=MediaQueryExp::isViewportDependent))
  * `min-width`, `min-height`, `max-width`, `max-height`, `width`, `height`
  * `aspect-ratio`, `min-aspect-ratio`, `max-aspect-ratio`
  * `device-pixel-ratio`, `resolution`, `orientation` 
1. The property requested is one of the following 获取下面任意一个属性:  ([source](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/css/CSSComputedStyleDeclaration.cpp&sq=package:chromium&l=457&dr=C&q=isLayoutDependent))
  * `height`, `width`
  * `top`, `right`, `bottom`, `left`
  * `margin` [`-top`, `-right`, `-bottom`, `-left`, or *shorthand* 或者缩写] only if the margin is fixed 只有margin固定的时候.
  * `padding` [`-top`, `-right`, `-bottom`, `-left`, or *shorthand* 或者缩写] only if the padding is fixed 只有margin固定的时候.
  * `transform`, `transform-origin`, `perspective-origin`
  * `translate`, `rotate`, `scale`
  * `webkit-filter`, `backdrop-filter`
  * `motion-path`, `motion-offset`, `motion-rotation`
  * `x`, `y`, `rx`, `ry`

### window

* `window.scrollX`, `window.scrollY`
* `window.innerHeight`, `window.innerWidth`
* `window.getMatchedCSSRules()` only forces style 只会强制样式


### Forms 表单

* `inputElem.focus()`
* `inputElem.select()`, `textareaElem.select()` ([source](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/html/HTMLTextFormControlElement.cpp&q=updateLayoutIgnorePendingStylesheets%20-f:out%20-f:test&sq=package:chromium&l=192&dr=C))

### Mouse events 鼠标事件

* `mouseEvt.layerX`, `mouseEvt.layerY`, `mouseEvt.offsetX`, `mouseEvt.offsetY` ([source](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/events/MouseRelatedEvent.cpp&q=f:mouserelatedevent%20computeRelativePosition&sq=package:chromium&type=cs&l=132))

### document

* `doc.scrollingElement` only forces style 只会强制样式

### Range

* `range.getClientRects()`, `range.getBoundingClientRect()`

### SVG

* Quite a lot; haven't made an exhaustive list , but [Tony Gentilcore's 2011 Layout Triggering List](http://gent.ilcore.com/2011/03/how-not-to-trigger-layout-in-webkit.html) pointed to a few.
相当多；没有一个完整的列表，但是[Tony Gentilcore's 2011 Layout Triggering List](http://gent.ilcore.com/2011/03/how-not-to-trigger-layout-in-webkit.html)给出了一些。


### contenteditable 内容编辑
  
* Lots & lots of stuff, …including copying an image to clipboard 很多，包括复制图片到一个剪贴板 ([source](https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/core/editing/Editor.cpp&sq=package:chromium&l=420&dr=C&rcl=1442532378))
  

## Appendix 附录

* If layout is forced, style must be recalculated first. So forced layout triggers both operations. Their costs are very dependent on the content/situation, but typically both operations are similar in cost.
如果强制布局了，样式首先要被重新计算。所以强制布局触发两个操作。他们的成本根据内容而定，通常两个操作成本都差不多。

##### Cross-browser 夸浏览器
* The above data was built by reading the Blink source, so it's true for Chrome, Opera, and most android browsers 上面的数据通过阅读Blink源代码构建的，所有对Chrome，Opear和大部分android浏览器都有效.
* [Tony Gentilcore's Layout Triggering List](http://gent.ilcore.com/2011/03/how-not-to-trigger-layout-in-webkit.html) was for 2011 WebKit and generally aligns with the above 这个是针对2011年WebKit的基本上跟上面的一致. 
* Modern WebKit's instances of forced layout are mostly consistent 现代的WebKit强制布局的实例都差不多: [`updateLayoutIgnorePendingStylesheets` - GitHub search - WebKit/WebKit ](https://github.com/WebKit/webkit/search?q=updateLayoutIgnorePendingStylesheets&utf8=%E2%9C%93)
* Gecko's reflow appears to be requested via FrameNeedsReflow. Results Gecko的回流在通过FrameNeedsreflow的时候出现。 结果: [`FrameNeedsReflow` - mozilla-central search](http://lxr.mozilla.org/mozilla-central/search?string=FrameNeedsReflow&find=&findi=%5C.c&filter=%5E%5B%5E%5C0%5D*%24&hitlimit=&tree=mozilla-central)
* No concrete data on Edge/IE, but it should fall roughly in line, as the return values for these properties are spec'd. What would differ is the amount of clever optimization. 没有Edge/IE的具体数据，应该会少几行跟说明的上属性的返回值，可能会跟跟大部分明智的优化不同。

##### Browsing the Chromium source 查看Chromium源代码:
* forced layout (and style recalc) 强制布局（和强制样式重计算）: [`updateLayoutIgnorePendingStylesheets` - Chromium Code Search](https://code.google.com/p/chromium/codesearch#search/&q=updateLayoutIgnorePendingStylesheets%20-f:out%20-f:test&sq=package:chromium&type=cs)
* forced style recalc 强制样式重新计算: [`updateLayoutTree` - Chromium Code Search](https://code.google.com/p/chromium/codesearch#search/&q=updateLayoutTree%20-f:out&p=1&sq=package:chromium&type=cs)

#### CSS Triggers

[CSS Triggers](http://csstriggers.com/) is a related resource and all about what operations are required to happen in the browser lifecycle as a result of setting/changing a given CSS value. It's a great resource.  The above list, however, are all about what forces the purple/green/darkgreen circles synchronously from JavaScript.
[CSS Triggers](http://csstriggers.com/) 上面包含了在浏览器的声明周期中所有的改变一个CSS指定值的操作导致的结果。很牛逼的资源。上面的列表都是来自JavaScript的强制 紫色/绿色/暗绿色 的循环同步。

#### More on forced layout 更多强制布局的资料

* [Avoiding layout thrashing — Web Fundamentals](https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing?hl=en)
* [Fixing Layout thrashing in the real world | Matt Andrews](https://mattandre.ws/2014/05/really-fixing-layout-thrashing/)
* [Timeline demo: Diagnosing forced synchronous layouts - Google Chrome](https://developer.chrome.com/devtools/docs/demos/too-much-layout)
* [Preventing &apos;layout thrashing&apos; | Wilson Page](http://wilsonpage.co.uk/preventing-layout-thrashing/)
* [wilsonpage/fastdom](https://github.com/wilsonpage/fastdom)
* [Rendering: repaint, reflow/relayout, restyle / Stoyan](http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/)
* [We spent a week making Trello boards load extremely fast. Here’s how we did it. - Fog Creek Blog](http://blog.fogcreek.com/we-spent-a-week-making-trello-boards-load-extremely-fast-heres-how-we-did-it/)
* [Minimizing browser reflow  |  PageSpeed Insights  |  Google Developers](https://developers.google.com/speed/articles/reflow?hl=en)

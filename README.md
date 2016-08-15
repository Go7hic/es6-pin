# es6-pin
页面向下滚动的时候固定某个元素在顶部

## Install
`npm install es6-pin --save`


## Usage

```
import Pin from 'es6-pin'
new Pin('.record-top-banner','.record-head',30, {
  onPin() {
  //
  },
  onUnpin() {
  //
  }
});
```
## 方法说明

- `.record-top-banner` 表示你需要固定在顶部的元素（必填）
- `.record-head` 表示当滚动超过这个元素的时候开始固定（可选,不填则是0）
- `30` 表示在 `.record-head` 的基础上再加 30象素高，可自定义。（可选，不填则是0）
- `onPin` 表示当固定的时候执行的回调
- `onUnpin` 表示当移除固定的时候执行的回调

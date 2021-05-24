//fabric.jsを使ったお絵かき
document.addEventListener('DOMContentLoaded', function () { //windows.onloadは複数使えないので代わり

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 1000;

  let LineWidthSave = 5; //消しゴムを使った後で元のペンサイズに戻すための記録用
  let lastSelectdColorBtn = document.getElementById("black");

  let lockHistory = false;//Undo/Redo時の描画イベントに反応させないためのフラグ
  const undo_history = [];
  const redo_history = [];


  const canvas = new fabric.Canvas("canvas", {
    freeDrawingCursor: 'none',//自作のドットカーソルを表示するために必要
    isDrawingMode: true
  });
  canvas.setHeight(CANVAS_HEIGHT);
  canvas.setWidth(CANVAS_WIDTH);
  canvas.setBackgroundColor(
    "rgba(255, 255, 255, 1)",
    canvas.renderAll.bind(canvas)
  );

  //オブジェクト選択時のハンドルを太くする
  fabric.Object.prototype.set({
    borderColor: "rgb(178,204,0)",//選択枠の色
    borderScaleFactor: 6,//選択枠の太さ
    cornerSize: 20,//コーナーハンドルのサイズ
    cornerColor: "rgba(0, 0, 0, 0.5)",//コーナーハンドルの色
    transparentCorners: false,//コーナーハンドルの不透明同
    cornerStrokeColor: "rgba(255, 0, 0, 1)",//コーナーハンドルの輪郭の色
    cornerStyle: "circle"//コーナーハンドルの形（circle or rect）
  });
  // fabric.Object.prototype.cornerSize = 20
  // fabric.Object.prototype.cornerColor ="rgba(0,0,0,0.5)";
  // fabric.Object.prototype.transparentCorners=false;
  // fabric.Object.prototype.cornerStrokeColor ="rgba(255,0,0,1)";
  // fabric.Object.prototype.cornerStyle="circle";//or rect

  // canvas.isDrawingMode = true; // お絵かきモードの有効化
  canvas.freeDrawingBrush.color = "rgb(0,0,0)"; // 描画する線の色、初期値
  canvas.freeDrawingBrush.width = 5; // 描画する線の太さ、初期値

  undo_history.push(JSON.stringify(canvas));//とりあえず最初の状態をUNDOバッファに記録

  //色選択ボタンの設定
  const selectColorBtn = document.getElementsByClassName("color");

  for (i = 0; i < selectColorBtn.length; i++) {
    selectColorBtn[i].addEventListener("click", function (e) {
      lastSelectdColorBtn = this;
      //ボタンが自分の色を取得して描画色にする
      const btnColor = window
        .getComputedStyle(this, null)
        .getPropertyValue("background-color");
      console.log(btnColor);
      canvas.freeDrawingBrush.color = btnColor; // 描画する線の色
      canvas.freeDrawingBrush.width = LineWidthSave;//線幅を戻す（消しゴムからの復帰用）
      //ドットカーソルのサイズも変更
      cursor.style.setProperty("--cursor-size", LineWidthSave + "px");
      cursor.style.setProperty("--cursor-offset", -parseInt(LineWidthSave) / 2 + "px");

      cursor.style.setProperty("background", btnColor);//ドットカーソルの色を変更

      //描画モードに変更
      canvas.isDrawingMode = true;
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      clearSelectedButton();
      this.classList.add("selected"); //選択されたボタンはボーダーを太くする
    });
  }

  //ブラシサイズボタンの設定
  const selectLineWidthBtn = document.getElementsByClassName("selectLineWidth");

  for (i = 0; i < selectLineWidthBtn.length; i++) {
    selectLineWidthBtn[i].addEventListener("click", function (e) {

      //ボタンが自分の値を取得してペンサイズにセット
      canvas.freeDrawingBrush.width = parseInt(this.value);
      LineWidthSave = parseInt(this.value);

      //ドットカーソルのサイズを変更
      cursor.style.setProperty("--cursor-size", this.value + "px");
      cursor.style.setProperty("--cursor-offset", -parseInt(this.value) / 2 + "px");

      clearSelectedButton();
      lastSelectdColorBtn.classList.add("selected");

      //描画モードに変更
      canvas.isDrawingMode = true;
      canvas.discardActiveObject();
      canvas.requestRenderAll();

    });
  }

  //カーソル用のdivの位置をマウスに追従させる
  document.addEventListener("mousemove", function (e) {
    cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    // "translate(" + e.clientX + "px, " + e.clientY + "px)";
  });


  //canvas内でドットカーソルを表示
  document.getElementById("canvas-container").addEventListener("mouseover", function (e) {
    console.log("over");
    document.getElementById("cursor").classList.add("showDotCursor");
    document.getElementById("cursor").classList.remove("hideDotCursor");
  });

  //canvas外でドットカーソルを消す
  document.getElementById("canvas-container").addEventListener("mouseout", function (e) {
    console.log("out!");
    document.getElementById("cursor").classList.add("hideDotCursor");
    document.getElementById("cursor").classList.remove("showDotCursor");
  });



  //ボタンの輪郭をノーマルに戻す
  function clearSelectedButton() {
    const btn = document.getElementsByClassName("color");
    for (i = 0; i < btn.length; i++) {
      btn[i].classList.remove("selected");
    }
    document.getElementById("editMode").classList.remove("selected");
  }

  //ダウンロードの処理
  document.getElementById("download").addEventListener("click", function (e) {
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    let canvasToDL = document.getElementById("canvas");
    let link = document.createElement("a");
    link.href = canvasToDL.toDataURL("image/png");
    link.download = "drawing.png";
    link.click();
  });

  //消しゴムの処理
  document
    .getElementById("eraser") //消しゴムはサイズの大きい白いペンで代用
    .addEventListener("click", function (e) {
      //色とサイズを変更
      canvas.freeDrawingBrush.width = parseInt(this.value);
      canvas.freeDrawingBrush.color = "white";
      //ドットカーソルのサイズを変更
      cursor.style.setProperty("--cursor-size", this.value + "px");
      cursor.style.setProperty("--cursor-offset", -parseInt(this.value) / 2 + "px");
      //描画モードに変更
      canvas.isDrawingMode = true;
      canvas.discardActiveObject();
      canvas.requestRenderAll();

    });

  //全消去の処理
  document.getElementById("clear").addEventListener("click", () => {
    canvas.clear();
    canvas.setBackgroundColor(
      "rgba(255, 255, 255, 1)",
      canvas.renderAll.bind(canvas)
    );
    undo_history.push(JSON.stringify(canvas));//UNDO処理
    undoBtn.removeAttribute("disabled");

  });

  //編集モードボタンの処理
  document.getElementById("editMode").addEventListener("mouseup", function (e) {
    if (canvas.isDrawingMode) {
      canvas.isDrawingMode = false;
      clearSelectedButton();
      this.classList.add("selected"); //選択されたボタンはボーダーを太くする
    }
    else {
      canvas.isDrawingMode = true;
      clearSelectedButton();
      lastSelectdColorBtn.classList.add("selected");
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }

  });

  //deleteボタンの処理
  const deleteBtn = document.getElementById("delete");

  //オブジェクトが選択された時だけdeleteボタンを有効にする
  canvas.on("selection:created", function () {
    deleteBtn.removeAttribute("disabled");
  });
  canvas.on("selection:cleared", function () {
    deleteBtn.setAttribute("disabled", true);
  });

  deleteBtn.addEventListener("click", function () {
    deleteSelectedObjects();
  });

  function deleteSelectedObjects() {
    lockHistory = true;
    canvas.getActiveObjects().forEach(element => {
      canvas.remove(element);
    });
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    undo_history.push(JSON.stringify(canvas));//UNDO処理
    undoBtn.removeAttribute("disabled");
    lockHistory = false;
  }

  //キーボードでオブジェクトを消去
  document.addEventListener("keyup", function (e) {
    console.log(e.keyCode);
    if (e.keyCode == 8 | e.keyCode == 46) {
      deleteSelectedObjects();
    }
  });

  //テキストエリアなどの編集しているときにdeleteキーが誤動作するのを防ぐ
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#canvas-container')) {
      //ここに外側をクリックしたときの処理
      console.log("OUTSIDE!");
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    } else {
      //ここに内側をクリックしたときの処理
      console.log("inside!");
    }
  });

  const undoBtn = document.getElementById("undo");
  undoBtn.addEventListener('click', undo);
  const redoBtn = document.getElementById("redo");
  redoBtn.addEventListener('click', redo);


  canvas.on('object:added', function () {
    if (lockHistory) return;
    console.log('object:added');
    undo_history.push(JSON.stringify(canvas));
    undoBtn.removeAttribute("disabled");
    redo_history.length = 0;
    redoBtn.setAttribute("disabled", true);
    console.log(undo_history.length);
  });

  canvas.on('object:modified', function () {
    if (lockHistory) return;
    console.log('object:modified');
    undo_history.push(JSON.stringify(canvas));
    undoBtn.removeAttribute("disabled");
    redo_history.length = 0;
    redoBtn.setAttribute("disabled", true);
    console.log(undo_history.length);
  });

  canvas.on('object:removed', function () {
    if (lockHistory) return;
    console.log('object:removed');
    undo_history.push(JSON.stringify(canvas));
    undoBtn.removeAttribute("disabled");
    redo_history.length = 0;
    redoBtn.setAttribute("disabled", true);
    console.log(undo_history.length);
  });

  function undo() {
    if (undo_history.length > 0) {
      lockHistory = true;
      if (undo_history.length > 1) {//最初の白紙はredoに入れない
        redo_history.push(undo_history.pop());
        redoBtn.removeAttribute("disabled");
        if (undo_history.length === 1) undoBtn.setAttribute("disabled", true);
      }
      const content = undo_history[undo_history.length - 1];
      canvas.loadFromJSON(content, function () {
        canvas.renderAll();
        lockHistory = false;
      });
    }
  }

  function redo() {
    if (redo_history.length > 0) {
      lockHistory = true;
      const content = redo_history.pop();
      if (redo_history.length === 0) redoBtn.setAttribute("disabled", true);
      undo_history.push(content);
      undoBtn.removeAttribute("disabled");
      canvas.loadFromJSON(content, function () {
        canvas.renderAll();
        lockHistory = false;
      });
    }
  }
  
});


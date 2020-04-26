class Point {
    constructor(x, y) {
        this.x = x;       //x座標
        this.y = y;　　　　//y座標
        this.next = null;   // 次の点
        this.temp = null;   // 暫定的な次の点
        this.number = 0; //描かれた円の数
    }

    /**
     * この点からパラメータで与えられた点までの距離を計算する
     * 呼び出すときはp1.distance(p2)のように書く
     * @param p {Point} - 距離を計算したい点
     * @returns {number} - 距離
     */
    distance( p )//長さを求める
    {
        return (Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2)));//三平方の定理で距離を求める
    }

    /**
     * この点から次の点までの距離を計算する
     * @returns {number} - 距離
     */
    distance_chain()
    {
        let start = this;
        var pi = start;
        let distance = 0;
        do {
            distance += Math.sqrt(Math.pow(pi.x - pi.next.x, 2) + Math.pow(pi.y - pi.next.y, 2))
            pi = pi.next;
        } while(pi != start);

        return distance;
    }

    /**
     * この点から，暫定的な次の点までの距離を計算する
     * @returns {number} - 距離
     */
    distance_temp()
    {
        let start = this;
        var pi = start;
        let distance = 0;
        do {
            if (pi.temp != null) {
                distance += Math.sqrt(Math.pow(pi.x - pi.temp.x, 2) + Math.pow(pi.y - pi.temp.y, 2))
                pi = pi.temp;
            } else {
                distance += Math.sqrt(Math.pow(pi.x - pi.next.x, 2) + Math.pow(pi.y - pi.next.y, 2))
                pi = pi.next;
            }

        } while(pi != start);

        return distance;
    }

    chain( p, count ) {
        this.next = p;
        this.number = count;
    }

    change( p ) {
        this.temp = p.next;
        p.temp = this.next;
        this.next.temp = p.next.next;
        p.next.temp = this.next.next;
        return [ this.x, this.y, this.next.x, this.next.y, this.next.next.x, this.next.next.y, p.x, p.y, p.next.x, p.next.y, p.next.next.x, p.next.next.y ];
    }

    change_to_temp() {
        let start = this;
        var pi = start;
        do {
            if (pi.temp != null) {
                pi.next = pi.temp;
                pi.temp = null;
            }
            pi = pi.next;
        } while(pi != start);
    }

    clear_temp() {
        let start = this;
        var pi = start;
        do {
            pi.temp = null;
            pi = pi.next;
        } while(pi != start);
    }
    debug() {
        let start = this;
        var pi = start;
        let list = [];
        list.push( pi.number );
        do {
            pi = pi.next;
            list.push( pi.number );
        } while(pi != start);

        return list;
    }

    debug_temp() {
        let start = this;
        var pi = start;
        let list = [];
        list.push( pi.temp );
        do {
                pi = pi.next;
            list.push( pi.temp );
        } while(pi != start);

        return list;
    }
}




class Graphics {
    constructor(number) {
        this.max = number;
        this.route = [];
        this.solve_canvas = document.querySelector('#original');
        this.ctx = this.solve_canvas.getContext('2d');
        this.twoopt = document.querySelector('#twoopt');
        this.tctx = this.twoopt.getContext('2d');
        this.nn = document.querySelector('#nn');
        this.nctx = this.nn.getContext('2d');
        this.optt = document.querySelector('#optt');
        this.ttctx = this.optt.getContext('2d');
        this.pa = [];
        this.number = 0; //円の数
        var tcount = 0; //2-optの表示で使う

        this.twoopt.addEventListener('click', (ev) => {
            if (this.max > this.number) {　//指定した円の数より現在の円の数が下回る場合
                let p = new Point(ev.offsetX, ev.offsetY);
                console.log(p);
                this.pa.push(p); //クリックして作った円を配列に入れ
                this.number++;//円が書かれた個数
                this.draw_point(ev.offsetX, ev.offsetY, 10);//サイズ10でクリックした位置に円を描く
            }
        });//クリックされた場所を取得してdrawを呼び出す

        document.querySelector("#clear").addEventListener("click", () => {
            this.ctx.clearRect(0, 0, 950, 420);
            this.tctx.clearRect(0, 0, 950, 420);
            this.nctx.clearRect(0, 0, 950, 420);
            this.ttctx.clearRect(0, 0, 950, 420);
            this.pa = [];
            this.number = 0;
        });　　　　　　　　//リセットボタンを押した時に描画領域、配列、個数をリセット

//canvas切り替え
        document.querySelector('#hyojio').addEventListener('click', ()=> {
            this.solve_canvas.style.display ="block";
            this.nn.style.display ="none";
            this.twoopt.style.display ="none";
            this.optt.style.display ="none";
        });
        document.querySelector('#hyojin').addEventListener('click', ()=> {
            this.solve_canvas.style.display ="none";
            this.nn.style.display ="block";
            this.twoopt.style.display ="none";
            this.optt.style.display ="none";
        });
        document.querySelector('#hyojit').addEventListener('click', ()=> {
            this.solve_canvas.style.display ="none";
            this.nn.style.display ="none";
            this.twoopt.style.display ="block";
            this.optt.style.display ="none";
        });
        document.querySelector('#hyojiopt').addEventListener('click', ()=> {
            this.solve_canvas.style.display ="none";
            this.nn.style.display ="none";
            this.twoopt.style.display ="none";
            this.optt.style.display ="block";
        });

        // 最近傍法によるルート設定
        document.querySelector("#start").addEventListener('click', () => {
            this.start = this.pa.shift();
            var pi = this.start;
            var count=0;
            while (this.pa.length > 0) {
                //console.log(this.pa.length);
                let near = this.shortest(pi);　//nearにpiからの最短を保存
                let next = this.pa.indexOf(near); //nextにnearを複製
                let p2 = this.pa.splice(next, 1)[0];
                pi.chain( p2, count );
                //console.log(count++);
                pi = p2;
            }
            pi.chain( this.start, count );
            //console.log( this.start.debug() );
            this.draw_next();

        var distance1 = this.start.distance_chain();
        var distance2 = this.start.distance_temp();
        for( let value of this.challenge() ) {
            //2-optでルートを改善
        }
            let Point = this.start;
            while (Point.next != this.start) {
                this.tctx.beginPath();
                this.tctx.strokeStyle = 'rgb(0,0,0)';
                this.tctx.moveTo(Point.x, Point.y);
                this.tctx.lineTo(Point.next.x, Point.next.y);
                this.tctx.stroke();
                Point = Point.next;
            }
             if (Point.next = this.start) {
                 this.tctx.beginPath();
                 this.tctx.strokeStyle = 'rgb(0,0,0)';
                 this.tctx.moveTo(Point.x, Point.y);
                 this.tctx.lineTo(this.start.x, this.start.y);
                 this.tctx.stroke();
             }
            //console.log(this.start.debug());
        });
         document.querySelector("#next").addEventListener('click', () => {//2-optの処理を2-optの探索を押すと順に表示される
             tcount=tcount+1;
             let crote = this.start;
             if(tcount == 1)
             {
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,255,0)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,255,0)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(255,0,0)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(255,0,0)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
             }
             if(tcount == 2){
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(240,248,255)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(240,248,255)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
             }
             if(tcount == 3){
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,255,0)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,255,0)';
                 this.ttctx.moveTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(255,0,0)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(255,0,0)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
             }
             if(tcount == 4){
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(240,248,255)';
                 this.ttctx.moveTo(crote.x, crote.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(240,248,255)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
             }
             if(tcount == 5){
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,255,0)';
                 this.ttctx.moveTo(crote.next.x, crote.next.y);
                 this.ttctx.lineTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,255,0)';
                 this.ttctx.moveTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(255,0,0)';
                 this.ttctx.moveTo(crote.next.x, crote.next.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(255,0,0)';
                 this.ttctx.moveTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
             }
             if(tcount == 6) {
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.next.x, crote.next.y);
                 this.ttctx.lineTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.next.x, crote.next.y);
                 this.ttctx.lineTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.strokeStyle = 'rgb(0,0,0)';
                 this.ttctx.moveTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(240,248,255)';
                 this.ttctx.moveTo(crote.next.x, crote.next.y);
                 this.ttctx.lineTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(240,248,255)';
                 this.ttctx.moveTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.lineTo(crote.next.x, crote.next.y);
                 this.ttctx.stroke();
             }
                 if(tcount == 7) {
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,255,0)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(0,255,0)';
                 this.ttctx.moveTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.lineTo(crote.x, crote.y);
                 this.ttctx.stroke();//探索箇所を緑色で描画
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(255,0,0)';
                 this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                 this.ttctx.lineTo(crote.x, crote.y);
                 this.ttctx.stroke();
                 this.ttctx.beginPath();
                 this.ttctx.strokeStyle = 'rgb(255,0,0)';
                 this.ttctx.moveTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                 this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                 this.ttctx.stroke();
             }
                 if(tcount == 8){
                     this.ttctx.beginPath();
                     this.ttctx.strokeStyle = 'rgb(0,0,0)';
                     this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                     this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                     this.ttctx.stroke();
                     this.ttctx.beginPath();
                     this.ttctx.strokeStyle = 'rgb(0,0,0)';
                     this.ttctx.moveTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                     this.ttctx.lineTo(crote.x, crote.y);
                     this.ttctx.stroke();//探索箇所を緑色で描画
                     this.ttctx.beginPath();
                     this.ttctx.strokeStyle = 'rgb(0,0,0)';
                     this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                     this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                     this.ttctx.stroke();
                     this.ttctx.beginPath();
                     this.ttctx.strokeStyle = 'rgb(0,0,0)';
                     this.ttctx.moveTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                     this.ttctx.lineTo(crote.x, crote.y);
                     this.ttctx.stroke();//探索箇所を緑色で描画
                     this.ttctx.beginPath();
                     this.ttctx.strokeStyle = 'rgb(240,248,255)';
                     this.ttctx.moveTo(crote.next.next.x, crote.next.next.y);
                     this.ttctx.lineTo(crote.x, crote.y);
                     this.ttctx.stroke();
                     this.ttctx.beginPath();
                     this.ttctx.strokeStyle = 'rgb(0,0,0)';
                     this.ttctx.moveTo(crote.next.next.next.next.x, crote.next.next.next.next.y);
                     this.ttctx.lineTo(crote.next.next.next.x, crote.next.next.next.y);
                     this.ttctx.stroke();
                 }
             else{}
                 });
    }

    draw_point(cx, cy, r) {//全てのキャンバスに円を描くメソッド
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
        this.ctx.strokeStyle = 'rgb(0,0,0)';
        this.ctx.fill();
        this.ctx.stroke();
        this.nctx.beginPath();
        this.nctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
        this.nctx.strokeStyle = 'rgb(0,0,0)';
        this.nctx.fill();
        this.nctx.stroke();
        this.tctx.beginPath();
        this.tctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
        this.tctx.strokeStyle = 'rgb(0,0,0)';
        this.tctx.fill();
        this.tctx.stroke();
        this.ttctx.beginPath();
        this.ttctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
        this.ttctx.strokeStyle = 'rgb(0,0,0)';
        this.ttctx.fill();
        this.ttctx.stroke();
    }

    draw_next() {//次の点までの線を描くメソッド
        this.nctx.beginPath();
        var pi = this.start;
        this.nctx.moveTo( pi.x, pi.y );
        this.ttctx.moveTo(pi.x,pi.y);
        do {
            this.nctx.lineTo( pi.x, pi. y );
            this.ttctx.lineTo( pi.x, pi.y );
            pi = pi.next;
        }while( pi != this.start )
        this.nctx.lineTo( this.start.x, this.start.y );
        this.nctx.stroke();
        this.ttctx.lineTo( this.start.x, this.start.y );
        this.ttctx.stroke();
        //console.log( this.start.debug() );
    }

    * challenge() {//2-optの処理
        var pi = this.start;
        var l = 0;
        do {
            var pi2 = pi.next.next;
            do {
                if( pi == pi2 ) break;
                //console.log( "->" + pi.number + "と" + pi2.number + "を変更");
                let coord = pi.change( pi2 );
                //console.log("change後");
                //console.log( this.start.debug() );
                //console.log( this.start.debug_temp() );
                let distance1 = this.start.distance_chain();
                let distance2 = this.start.distance_temp();
                //console.log( "元の距離=" + distance1 );
                //console.log( "変更後の距離=" + distance2 );
                yield( [ coord, distance1, distance2 ] );
                if( distance2 < distance1 ) {
                    this.start.change_to_temp();
                    this.start.clear_temp();
                    // pi.temp.next = pi.temp.temp;
                    // pi.temp.temp = null;
                    // pi2.temp.next = pi2.temp.temp;
                    // pi2.temp.temp = null;
                    // pi.next = pi.temp;
                    // pi.temp = null;
                    // pi2.next = pi2.temp;
                    // pi2.temp = null;
                    //console.log("changed");
                } else {
                    this.start.clear_temp();
                    // pi.temp.temp = null;
                    // pi2.temp.temp = null;
                    // pi.next.temp = null;
                    // pi2.next.temp = null;
                    // pi.temp = null;
                    // pi2.temp = null;
                }
                pi2 = pi2.next;
            }while( (pi2.next != this.start)&&(pi2!=this.start) );
            pi = pi.next;
        } while( pi.next.next != this.start );
    }
    shortest(p) {//pからの最小を求める
        var short;
        var d_min = 999999999;//現状の最小
        for (let pi of this.pa) {//piに配列paを複製
                let d1 = p.distance(pi);//d1にp-pi間の距離を代入
                if (d1 < d_min) {//新しいものが最小ならば
                    d_min = d1;//現状の最小を更新する
                    short = pi;//最小の終点を更新
                    //console.log(pi);
                }
        }

        return short;//最短のものを返す
    }

    distance_chain()
    {
        let pi = this.start;
        let distance = 0;
        do {
            distance += Math.sqrt(Math.pow(this.x - this.next.x, 2) + Math.pow(this.y - this.next.y, 2))
            pi = pi.next;
        } while(pi != this.start);

        return distance;
    }

    /**
     * この点から，暫定的な次の点までの距離を計算する
     * @returns {number} - 距離
     */
    distance_temp()
    {
        let pi = this.start;
        let distance = 0;
        do {
            if (pi.temp != null) {
                distance += Math.sqrt(Math.pow(this.x - this.temp.x, 2) + Math.pow(this.y - this.temp.y, 2))
                pi = pi.temp;
            } else {
                distance += Math.sqrt(Math.pow(this.x - this.next.x, 2) + Math.pow(this.y - this.next.y, 2))
                pi = pi.next;
            }
            //console.log( "探索: " + pi.number + "->" + pi.next.number );
        } while(pi != this.start);

        return distance;
    }

}

window.addEventListener('load', () => {
    var graphics = new Graphics(5); //this.maxに変えるか
});//最大値を指定


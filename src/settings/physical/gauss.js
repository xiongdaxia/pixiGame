function gauss(a, x, equ, vNum, eps) {
    let i;
    let j;
    let k;
    let col;
    let maxR;
    let temp;
    for (k = 0, col = 0; k < equ && col < vNum; k++, col++) {
        maxR = k;
        for (i = k + 1; i < equ; i++) {
            if (Math.abs(a[i][col]) > Math.abs(a[maxR][col])) {
                maxR = i;
            }
        }
        if (Math.abs(a[maxR][col]) < eps) {
            console.log('无唯一解');
            return x;
        }
        if (k !== maxR) {
            for (j = col; j < vNum; j++) {
                temp = a[k][j];
                a[k][j] = a[maxR][j];
                a[maxR][j] = temp;
            }
            temp = x[k];
            x[k] = x[maxR];
            x[maxR] = temp;
        }
        x[k] /= a[k][col];
        for (j = col + 1; j < vNum; j++) {
            a[k][j] /= a[k][col];
        }
        a[k][col] = 1;
        for (i = 0; i < equ; i++) {
            if (i !== k) {
                x[i] -= x[k] * a[i][k];
                for (j = col + 1; j < vNum; j++) {
                    a[i][j] -= a[k][j] * a[i][col];
                }
                a[i][col] = 0;
            }
        }
    }
    return x;
}
export default gauss;

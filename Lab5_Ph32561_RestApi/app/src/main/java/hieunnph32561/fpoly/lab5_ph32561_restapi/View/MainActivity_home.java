package hieunnph32561.fpoly.lab5_ph32561_restapi.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.widget.NestedScrollView;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.ProgressBar;

import java.util.ArrayList;

import hieunnph32561.fpoly.lab5_ph32561_restapi.R;
import hieunnph32561.fpoly.lab5_ph32561_restapi.adapter.FruitAdapter;
import hieunnph32561.fpoly.lab5_ph32561_restapi.databinding.ActivityMainBinding;
import hieunnph32561.fpoly.lab5_ph32561_restapi.databinding.ActivityMainHomeBinding;
import hieunnph32561.fpoly.lab5_ph32561_restapi.model.Fruit;
import hieunnph32561.fpoly.lab5_ph32561_restapi.model.Page;
import hieunnph32561.fpoly.lab5_ph32561_restapi.model.Response;
import hieunnph32561.fpoly.lab5_ph32561_restapi.services.HttpRequest;
import retrofit2.Call;
import retrofit2.Callback;

public class MainActivity_home extends AppCompatActivity implements FruitAdapter.FruitClick {

    ActivityMainHomeBinding biding;
    private HttpRequest httpRequest;
    private String token;
    private FruitAdapter adapter;

    private ArrayList<Fruit> ds = new ArrayList<>();
    private int page = 1;
    private int totalPage = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        biding = ActivityMainHomeBinding.inflate(getLayoutInflater());
        super.onCreate(savedInstanceState);
        setContentView(biding.getRoot());
        httpRequest = new HttpRequest();
        SharedPreferences sharedPreferences = getSharedPreferences("INFO", MODE_PRIVATE);

        token = sharedPreferences.getString("token","");
        httpRequest.callAPI().getPageFruit("Bearer " + token,page).enqueue(getListFruitResponse);
        userListener();
        biding.nestScrollView.setOnScrollChangeListener(new NestedScrollView.OnScrollChangeListener() {
            @Override
            public void onScrollChange(NestedScrollView v, int scrollX, int scrollY, int oldScrollX, int oldScrollY) {
                if (scrollY == (v.getChildAt(0).getMeasuredHeight() - v.getMeasuredHeight())) {
                    if (totalPage == page) return; // Nếu đã tải hết tất cả các trang thì không làm gì cả
                    if (biding.loadmore.getVisibility() == View.GONE) {
                        biding.loadmore.setVisibility(View.VISIBLE);
                        page++;
                        httpRequest.callAPI().getPageFruit("Bearer " + token, page).enqueue(getListFruitResponse);
                    }
                }
            }
        });
    }
    private void userListener () {
        biding.btnAdd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(MainActivity_home.this, MainActivity_Add.class));
            }
        });
    }
    private void userLoading() {

    }

    Callback<Response<Page<ArrayList<Fruit>>>> getListFruitResponse = new Callback<Response<Page<ArrayList<Fruit>>>>() {
        @Override
        public void onResponse(Call<Response<Page<ArrayList<Fruit>>>> call, retrofit2.Response<Response<Page<ArrayList<Fruit>>>> response) {
            if(response.isSuccessful()){
                if(response.body().getStatus() == 200 ) {
                    totalPage = response.body().getData().getTotalPage();
                    ArrayList<Fruit> fruitList = response.body().getData().getData();
                    getData(fruitList);
                }
            }
        }

        @Override
        public void onFailure(Call<Response<Page<ArrayList<Fruit>>>> call, Throwable t) {
            // Xử lý lỗi khi gọi API getListFruit
        }
    };

    private void getData (ArrayList<Fruit> _ds) {
        {
            if(biding.loadmore.getVisibility() == View.VISIBLE){
                new Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        adapter.notifyItemInserted(ds.size() -1);
                        biding.loadmore.setVisibility(View.GONE);
                        ds.addAll(_ds);
                        adapter.notifyDataSetChanged();
                    }
                },1000);
                return;

            }

        }
        ds.addAll(_ds);
        adapter = new FruitAdapter(ds,this, this );
        biding.rcvFruit.setAdapter(adapter);
    }
    public void delete(Fruit fruit){

  }
  @Override
    public void edit(Fruit fruit) {
        Intent intent =new Intent(MainActivity_home.this, MainActivity_Update.class);
        intent.putExtra("fruit", fruit);
        startActivity(intent);
    }

    @Override
    protected void onResume() {
        super.onResume();
        httpRequest.callAPI().getPageFruit("Bearer" + token, page).enqueue(getListFruitResponse);
    }

}
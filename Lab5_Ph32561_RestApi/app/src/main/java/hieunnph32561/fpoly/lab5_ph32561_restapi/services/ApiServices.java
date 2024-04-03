package hieunnph32561.fpoly.lab5_ph32561_restapi.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import hieunnph32561.fpoly.lab5_ph32561_restapi.model.Distributor;
import hieunnph32561.fpoly.lab5_ph32561_restapi.model.Fruit;
import hieunnph32561.fpoly.lab5_ph32561_restapi.model.Page;
import hieunnph32561.fpoly.lab5_ph32561_restapi.model.Response;
import hieunnph32561.fpoly.lab5_ph32561_restapi.model.User;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.PartMap;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiServices {
    public static String BASE_URL = "http://10.24.2.167:3000/api/";

    @GET("get-list-distributor")
    Call<Response<ArrayList<Distributor>>> getListDistributor();

    @GET("search-distributor")
    Call<Response<ArrayList<Distributor>>> searchDistributor(@Query("key") String key);

    @POST("add-distributor")
    Call<Response<Distributor>> addDistributor(@Body Distributor distributor);

    @PUT("update-distributor-by-id/{id}")
    Call<Response<Distributor>> updateDistributor(@Path("id") String id, @Body Distributor distributor);

    @DELETE("destroy-distributor-by-id/{id}")
    Call<Response<Distributor>> deleteDistributor(@Path("id") String id);

//    @Multipart
//    @POST("register-send-email")
//    Call<Response<User>> register(@Part("username") RequestBody username,
//                                  @Part("password") RequestBody password,
//                                  @Part("email") RequestBody email,
//                                  @Part("name") RequestBody name,
//                                  @Part MultipartBody.Part avatar);


    //
    @Multipart
    @POST("register-send-email")
    Call<Response<User>> register(
            @Part("username") RequestBody username,
            @Part("password") RequestBody password,
            @Part("email") RequestBody email,
            @Part("name") RequestBody name,
            @Part MultipartBody.Part avartar

    );

    @POST("login")
    Call<Response<User>> login (@Body User user);

    @GET("get-list-fruit")
    Call<Response<ArrayList<Fruit>>> getListFruit(@Header("Authorization")String token);
    @Multipart
    @POST("add-fruit-with-file-image")
    Call<Response<Fruit>> addFruitWithFileImage(@PartMap Map<String,RequestBody> requestBodyMap,
                                            @Part ArrayList<MultipartBody.Part> ds_hinh);
    @Multipart
    @PUT("update-fruit-by-id/{id}")
    Call<Response<Fruit>> updateFruitWithFileImage(@PartMap Map<String, RequestBody> requestBodyMap,
                                                   @Path("id") String id,
                                                   @Part ArrayList<MultipartBody.Part> ds_hinh
    );

    @GET("get-page-fruit")
    Call<Response<Page<ArrayList<Fruit>>>> getPageFruit(@Header("Authorization")String token,@Query("page") int page);

}

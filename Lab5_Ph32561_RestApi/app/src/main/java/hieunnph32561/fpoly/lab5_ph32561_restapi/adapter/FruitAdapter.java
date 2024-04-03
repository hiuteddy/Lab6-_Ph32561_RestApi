package hieunnph32561.fpoly.lab5_ph32561_restapi.adapter;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;

import hieunnph32561.fpoly.lab5_ph32561_restapi.R;
import hieunnph32561.fpoly.lab5_ph32561_restapi.databinding.ItemFruitBinding;
import hieunnph32561.fpoly.lab5_ph32561_restapi.model.Fruit;

public class FruitAdapter extends RecyclerView.Adapter<FruitAdapter.ViewHolder> {
    private ArrayList<Fruit> list;

    private Context context;
    private FruitClick fruitClick;

    public FruitAdapter(ArrayList<Fruit> list,Context context, FruitClick fruitClick) {
        this.context = context;
        this.list = list;
        this.fruitClick = fruitClick;
    }

    @NonNull
    @Override
    public FruitAdapter.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemFruitBinding binding = ItemFruitBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    public interface FruitClick {
        void delete(Fruit fruit);

        void edit(Fruit fruit);
    }


    @Override
    public void onBindViewHolder(@NonNull FruitAdapter.ViewHolder holder, int position) {
        Fruit fruit = list.get(position);
        holder.binding.tvName.setText(fruit.getName());
        holder.binding.tvPriceQuantity.setText("price :" + fruit.getPrice() + " - quantity: " + fruit.getQuantity());
        holder.binding.tvDes.setText(fruit.getDescription());
        String url = fruit.getImage().get(0);
        String newUrl = url.replace("localhost", "10.24.2.167:3000");
        Glide.with(context)
                .load(newUrl)
                .thumbnail(Glide.with(context).load(R.drawable.baseline_broken_image_24))
                .into(holder.binding.img);
        Log.d("023131", "onBindViewHolder: " + list.get(position).getImage().get(0));
        holder.binding.btnEdit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                fruitClick.edit(fruit);
            }
        });
    }

    @Override
    public int getItemCount() {
        return list.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        ItemFruitBinding binding;

        public ViewHolder(ItemFruitBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
